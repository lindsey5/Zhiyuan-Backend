import { NextFunction, Request, Response } from "express";
import StockTransfer from "../models/StockTransfer";

export const getStockTransferLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

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
        { $unwind: { path: "$receiver" } },

        // Lookup sender
        {
            $lookup: {
                from: "users",
                localField: "sender_id",
                foreignField: "_id",
                as: "sender",
            },
        },
        { $unwind: { path: "$sender" } },

        // Lookup items
        {
            $lookup: {
                from: "stocktransferitems",
                localField: "_id",
                foreignField: "transfer_id",
                as: "items",
            },
        },

        // Unwind items to populate variant
        { $unwind: { path: "$items" } },

        // Lookup variant for each item
        {
            $lookup: {
                from: "variants",
                localField: "items.variant",
                foreignField: "_id",
                as: "items.variant",
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

        res.status(200).json({
            success: true,
            stockTransferLogs,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
};