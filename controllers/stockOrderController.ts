import { NextFunction, Request, Response } from "express";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";
import StockOrder from "../models/StockOrder";
import DistributorNotification from "../models/DistributorNotification";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";

export const getStockOrders = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = (req.query.search as string) || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status || "";
        
        const cacheKey = `stock-orders:${page}:${limit}:${search}:${startDate}:${endDate}`;

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
                        { stock_order_id: { $regex: search, $options: "i" } }, 
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

        const [stockOrders, countResult] = await Promise.all([
            StockOrder.aggregate(pipeline),
            StockOrder.aggregate(countPipeline)
        ])

        const total = countResult[0]?.total || 0;

        const responseData = {
            stockOrders,
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

    }catch(err){
        next(err);
    }
}

export const getStockOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const stockOrder = await StockOrder.findById(req.params.id)
        .populate([
            { path: 'items.variant', populate: 'product' },
            { path: 'distributor', select: '-password' }
        ]);

        if(!stockOrder) return res.status(404).json({ success: false, message: "Stock Order not found"});

        res.status(200).json({ success: true, stockOrder })

    }catch(err){
        next(err);
    }
}

export const updateStockOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const stockOrder = await StockOrder.findById(req.params.id).session(session);

        if (!stockOrder) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Stock Order not found"
            });
        }

        if (stockOrder.status === req.body.status) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `The stock order status is already "${req.body.status}". Please refresh the page to see the latest updates.`
            });
        }

        const oldStatus = stockOrder.status;

        stockOrder.status = req.body.status;
        await stockOrder.save({ session });

        const distributorNotification = await DistributorNotification.create(
            [
                {
                    distributor_id: stockOrder.distributor_id,
                    stock_order_id: stockOrder._id,
                    message: `Your stock order has been updated to ${req.body.status}.`,
                },
            ],
            { session }
        );

        const notification = await distributorNotification[0].populate({
            path: "stockOrder",
            populate: [
                {
                    path: "items.variant",
                    populate: "product",
                },
                { path: "distributor", select: '-password' },
            ],
        });

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(
            notification,
            stockOrder.distributor_id.toString()
        );

        await AuditLogService.log({
            action: "STOCK_ORDER_UPDATED",
            description: `Stock order has been updated from ${oldStatus} to ${req.body.status}.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: {
                status: oldStatus
            },
            new_values: {
                status: req.body.status
            },
        });

        await deleteCache("stock-orders:*");

        return res.status(200).json({
            success: true,
            message: `Stock order successfully marked as ${req.body.status}`
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};