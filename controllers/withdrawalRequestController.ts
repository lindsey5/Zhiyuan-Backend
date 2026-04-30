import { NextFunction, Request, Response } from "express";
import WithdrawalRequest from "../models/WithdrawalRequest";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient from "../config/redis";

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