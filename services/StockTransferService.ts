import mongoose, { Types } from "mongoose";
import StockTransfer from "../models/StockTransfer";
import StockTransferItem from "../models/StockTransferItem";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import DistributorNotification from "../models/DistributorNotification";
import { deleteCache } from "../config/redis";

export default class StockTransferService {
    static async logStockTransfer({
        sender_id,
        receiver_id,
        stocks,
        session
    }: {
        sender_id: string;
        receiver_id: string;
        stocks: { variant_id: string; quantity: number }[];
        session: mongoose.ClientSession;
    }) {
        try {
            const stockTransfer = await StockTransfer.create(
                [{ sender_id, receiver_id }],
                { session }
            );

            const items = stocks.map((stock) => ({
                ...stock,
                transfer_id: stockTransfer[0]._id,
            }));


            await StockTransferItem.insertMany(items, {
                ordered: false,
                session,
            });

            await stockTransfer[0].populate([
                { path: "sender" },
                { path: "receiver"},
                { path: 'items' }
            ]);
            const sender = `${stockTransfer[0].sender.firstname} ${stockTransfer[0].sender.lastname}`;

            const totalStocks = items.reduce((acc, item) => item.quantity + acc, 0);

            const distributorNotification = await DistributorNotification.create(
                [{ 
                    distributor_id: receiver_id, 
                    transfer_id: stockTransfer[0]._id,
                    message: `${sender} requested to distribute ${totalStocks} ${totalStocks === 1 ? "stock" : "stocks"} to you.`
                }],
                { session }
            )

            const notification = await distributorNotification[0].populate({
                path: 'stockTransfer',
                populate: [
                    { path: 'sender', select: '-password'},
                    { path: 'receiver', select: '-password'},
                    {
                        path: 'items',
                        populate: {
                            path: 'variant',
                            populate: 'product'
                        }
                    }
                ]
            })
            await emitDistributorNotification(notification, receiver_id)
            await deleteCache("stock-transfer-logs:*")
            return stockTransfer
        } catch (err) {
            console.log(err);

            return null
        }
    }

    static async getTransferLogs({ 
        search,
        startDate,
        endDate,
        skip,
        limit,
        status,
        getOwn,
        myId
    } : {
        search: string;
        startDate: Date | null;
        endDate: Date | null;
        skip: number;
        limit: number;
        status: string;
        getOwn?: boolean;
        myId?: Types.ObjectId;
    }) {
        try{
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
                        transfer_no: { $first: "$transfer_no" },
                        receiver: { $first: "$receiver" },
                        sender: { $first: "$sender" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        status: { $first: '$status' },
                        items: { $push: "$items" },
                    },
                },
                {
                    $project: {
                        "sender.password": 0,
                        "sender.__v": 0,
                        "receiver.password": 0,
                        "receiver.__v": 0,
                    }
                }
            ];
    
            // Build search & date filter
            const match: any = { 
                ...( getOwn && myId && { "sender._id": myId })
            };

            if (search) {
                match.$or = [
                    { transfer_no: { $regex: search, $options: "i" } },
                    { "receiver.distributor_name": { $regex: search, $options: "i" } },
                    { "receiver.email": { $regex: search, $options: "i" } },
                    ...( !getOwn && !myId ? [
                        { "sender.firstname": { $regex: search, $options: "i" } },
                        { "sender.lastname": { $regex: search, $options: "i" } },
                        { "sender.email": { $regex: search, $options: "i" } }
                    ] : []),
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

            return { stockTransferLogs, total }
        }catch (err : any) {
            throw new Error(err);
        }
    }
}