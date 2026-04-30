import { NextFunction, Request, Response } from "express";
import WithdrawalRequest from "../models/WithdrawalRequest";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";
import mongoose from "mongoose";
import DistributorNotification from "../models/DistributorNotification";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";

export const getWithdrawalRequests = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = (req.query.search as string) || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status || "";

        const cacheKey = `withdrawal-requests:${page}:${limit}:${search}:${startDate}:${endDate}:${status}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        // Base match filter
        const matchStage: any = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = startDate;
            if (endDate) matchStage.createdAt.$lte = endDate;
        }

        if(status){
            matchStage.status = status;
        }

        const pipeline : any = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "distributors",
                    localField: "distributor_id",
                    foreignField: "_id",
                    as: "distributor"
                }
            },
            { $unwind: { path: '$distributor' }}
        ]

        if(search){
            pipeline.push({
                $match: {
                    $or: [
                        { 'distributor.distributor_name': { $regex: search, $options: "i" } },
                        { 'distributor.distributor_id': { $regex: search, $options: "i" } },
                        { 'distributor.email': { $regex: search, $options: "i" } },
                    ]
                }
            })
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: { "distributor.password": 0 }
            }
        );

        const [withdrawalRequests, countResult] = await Promise.all([
            WithdrawalRequest.aggregate(pipeline),
            WithdrawalRequest.aggregate(countPipeline)
        ])

        const total = countResult[0]?.total || 0;

        const responseData = {
            withdrawalRequests,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData
        });

    } catch(err){
        next(err);
    }
}

export const getWithdrawalRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const withdrawalRequest = await WithdrawalRequest.findById(req.params.id).populate("distributor");

        if(!withdrawalRequest) return res.status(404).json({ success: false, message: "Withdrawal Request not found" });

        res.status(200).json({
            success: true,
            withdrawalRequest
        })

    } catch(err){
        next(err);
    }
}

export const updateWithdrawalRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        const withdrawalRequest = await WithdrawalRequest.findById(req.params.id)
        .populate({
            path: 'distributor',
            select: '-password'
        });

        if(!withdrawalRequest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ 
                success: false, 
                message: "Withdrawal Request not found" 
            });
        }
        
        const oldValues = withdrawalRequest;

        const newStatus = req.body.status;
        const currentStatus = withdrawalRequest.status;

        // Allowed status transitions (cannot go backwards)
        const allowedTransitions: Record<string, string[]> = {
            pending: ["approved", "rejected"],
            approved: ["completed", "cancelled"],
            completed: [],
            cancelled: [],
            rejected: [],
        };

        const allowedNextStatuses = allowedTransitions[currentStatus] || [];
        if (!allowedNextStatuses.includes(newStatus)) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `Cannot update status from ${currentStatus} to ${newStatus}. Please reload the page`,
            });
        }

        withdrawalRequest.status = newStatus;
        await withdrawalRequest.save({ session });

        const distributorNotification = await DistributorNotification.create(
        [
            {
            distributor_id: withdrawalRequest.distributor_id,
            withdrawal_id: withdrawalRequest._id,
            message: `Your withdrawal request has been ${newStatus}.`,
            },
        ],
        { session }
        );

        const notification = await distributorNotification[0].populate({
            path: 'withdrawalRequest',
            populate: {
                path: "distributor",
                select: "-password"
            }
        })

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(
            notification,
            withdrawalRequest.distributor_id.toString()
        );

        await AuditLogService.log({
            action: "WITHDRAWAL_REQUEST_UPDATED",
            description: `Withdral Request has been updated from ${currentStatus} to ${newStatus}.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: oldValues,
            new_values: withdrawalRequest
        });

        await deleteCache("withdrawal-requests:*");

        return res.status(200).json({
            success: true,
            message: `Withdrawal Request successfully ${newStatus}`,
            withdrawalRequest
        });
    } catch(err) {
        next(err);
    }
}