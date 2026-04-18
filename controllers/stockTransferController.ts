import { NextFunction, Request, Response } from "express";
import StockTransfer from "../models/StockTransfer";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";
import { AuthRequest } from "../types/auth";
import DistributorNotification from "../models/DistributorNotification";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import mongoose from "mongoose";
import Variant from "../models/Variant";
import AuditLogService from "../services/AuditLogService";

export const getStockTransferLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status || "";

        const cacheKey = `stock-transfer-logs:${search}:${page}:${limit}:${startDate}:${endDate}:${status}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const pipeline: any[] = [
            // Lookup receiver
            {
                $lookup: {
                    from: "distributors",
                    localField: "receiver_id",
                    foreignField: "_id",
                    as: "receiver",
                },
            },
            { $unwind: "$receiver" },

            // Lookup sender
            {
                $lookup: {
                    from: "users",
                    localField: "sender_id",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            { $unwind: "$sender" },

            // Lookup items
            {
                $lookup: {
                    from: "stocktransferitems",
                    localField: "_id",
                    foreignField: "transfer_id",
                    as: "items",
                },
            },
            { $unwind: "$items" },

            // Lookup variant
            {
                $lookup: {
                    from: "variants",
                    localField: "items.variant_id",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },

            // Lookup product (inside variant)
            {
                $lookup: {
                    from: "products",
                    localField: "variant.product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },

            // Attach variant + product into items
            {
                $addFields: {
                    "items.variant": {
                        $mergeObjects: ["$variant", { product: "$product" }],
                    },
                },
            },

            // Remove temporary fields
            {
                $project: {
                    variant: 0,
                    product: 0,
                },
            },

            // Group items back into array
            {
                $group: {
                    _id: "$_id",
                    receiver: { $first: "$receiver" },
                    sender: { $first: "$sender" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    status: { $first: '$status' },
                    items: { $push: "$items" },
                },
            },
        ];

        // Build search & date filter
        const match: any = {};
        if (search) {
            match.$or = [
                { "receiver.distributor_name": { $regex: search, $options: "i" } },
                { "receiver.email": { $regex: search, $options: "i" } },
                { "sender.firstname": { $regex: search, $options: "i" } },
                { "sender.lastname": { $regex: search, $options: "i" } },
                { "sender.email": { $regex: search, $options: "i" } },
            ];
        }

        if(status){
            match.status = status;
        }

        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = startDate;
            if (endDate) match.createdAt.$lte = endDate;
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        // Count total documents
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await StockTransfer.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Sort, skip, limit for pagination
        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const stockTransferLogs = await StockTransfer.aggregate(pipeline);

        const responseData = {
            stockTransferLogs,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        })

        res.status(200).json({
            success: true,
            ...responseData
        })
        
    } catch (err) {
        next(err);
    }
};

export const updateStockTransferLogStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const stockTransfer = await StockTransfer.findById(req.params.id)
            .session(session)
            .populate([
                { path: "sender" },
                { path: "receiver" },
                {
                    path: "items",
                    populate: {
                        path: "variant",
                        populate: "product",
                    },
                },
            ]);

        if (!stockTransfer) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Stock transfer not found",
            });
        }

        if(req.body.status === 'cancelled' || req.body.status === 'rejected' || req.body.status === 'failed'){
            for(const item of stockTransfer.items){
                const variant = await Variant.findById(item.variant_id);

                if(!variant) continue;

                variant.stock += item.quantity;
                await variant.save({ session })
            }
        }

        stockTransfer.status = req.body.status;
        await stockTransfer.save({ session });

        const message = `Stock distribution status has been updated to ${req.body.status}.`;

        const distributorNotification = await DistributorNotification.create(
            [
                {
                    distributor_id: stockTransfer.receiver_id,
                    transfer_id: stockTransfer._id,
                    message,
                },
            ],
            { session }
        );

        const notification = await distributorNotification[0].populate({
            path: "stockTransfer",
            populate: {
                path: "items",
                populate: {
                    path: "variant",
                    populate: "product",
                },
            },
        });

        await session.commitTransaction();
        session.endSession();
        
        // emit AFTER commit
        await emitDistributorNotification(notification, stockTransfer.receiver_id.toString());
        await deleteCache("stock-transfer-logs:*");
        await deleteCache(`products:*`);
        await deleteCache(`variants:*`);
        await deleteCache(`distributor-stocks:*`);
                
        await AuditLogService.log({
            action: "STOCK_DISTRIBUTION_UPDATED",
            description: `A stock distribution has been updated to ${stockTransfer.status}`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: stockTransfer
        });

        return res.status(200).json({
            success: true,
            message: `Status successfully marked as ${stockTransfer.status}`,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};