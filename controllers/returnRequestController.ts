import { NextFunction, Request, Response } from "express";
import ReturnRequest from "../models/ReturnRequest";
import DistributorStock from "../models/DistributorStock";
import Distributor from "../models/Distributor";
import { emitDistributorNotification } from "../sockets/namespaces/distributorNotification.namespace";
import DistributorNotification from "../models/DistributorNotification";
import mongoose from "mongoose";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";

export const getReturnRequests = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        await ReturnRequest.updateMany(
            { createdAt: { $lt: sevenDaysAgo } },
            { $set: { "items.$[elem].status": "expired" } },
            { arrayFilters: [{ "elem.status": "pending" }] }
        );

        const cacheKey = `returnRequests:${page}:${limit}:${search}:${startDate}:${endDate}:${order}`;
        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const matchStage: any = {};

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = startDate;
            if (endDate) matchStage.createdAt.$lte = endDate;
        }

        const pipeline: any[] = [
        { $match: matchStage },

        {
            $lookup: {
            from: "distributors",
            localField: "distributor_id",
            foreignField: "_id",
            as: "distributor"
            }
        },
        { $unwind: "$distributor" },

        // unwind items so we can lookup per item
        { $unwind: "$items" },

        {
            $lookup: {
            from: "variants",
            localField: "items.variant_id",
            foreignField: "_id",
            as: "variant"
            }
        },
        { $unwind: "$variant" },

        {
            $lookup: {
            from: "products",
            localField: "variant.product_id",
            foreignField: "_id",
            as: "product"
            }
        },
        { $unwind: "$product" },

        // attach variant + product into items
        {
            $addFields: {
                "items.variant": {
                $mergeObjects: [
                    "$variant",
                    { product: "$product" }
                ] 
                }
            }
        },

        // group back items into array
        {
            $group: {
                _id: "$_id",
                distributor_id: { $first: "$distributor_id" },
                reason: { $first: "$reason" },
                distributor: { $first: "$distributor" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                items: { $push: "$items" }
            }
        }
        ];

        if (search) {
            pipeline.push({
                $match: {
                $or: [
                    { "distributor.distributor_name": { $regex: search, $options: "i" } },
                    { "distributor.distributor_id": { $regex: search, $options: "i" } },
                    { "distributor.email": { $regex: search, $options: "i" } }
                ]
                }
            });
        }

        const [returnRequests, countResult] = await Promise.all([
            ReturnRequest.aggregate([
                ...pipeline,
                { $sort: { createdAt: order } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                    "distributor.password": 0
                    }
                }
            ]),
            ReturnRequest.aggregate([...pipeline, { $count: 'total' }])
        ])

        const total = countResult[0]?.total || 0;
        const responseData = {
            returnRequests,
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

export const getReturnRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const returnRequest = await ReturnRequest.findById(req.params.id).populate([
            { path: 'distributor' },
            { path: 'items.variant', populate: 'product' }
        ]);

        if(!returnRequest) return res.status(404).json({ success: false, message: "Return request not found" });

        res.status(200).json({
            success: true,
            returnRequest
        })
    }catch(err){
        next(err);
    }
}

export const updateReturnRequestItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const returnId = req.params.return_id;
        const distributorId = req.params.distributor_id;
        const variantId = req.params.variant_id;
        const { status } = req.body;

        const distributor = await Distributor.findById(distributorId).session(session);

        if (!distributor) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({ success: false, message: "Distributor not found" });
        }

        const returnRequest = await ReturnRequest.findById(returnId).session(session);

        if (!returnRequest) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({ success: false, message: "Return Request not found" });
        }

        if (returnRequest.distributor_id.toString() !== distributor._id.toString()) {
            await session.abortTransaction();
            session.endSession();

            return res.status(403).json({
                success: false,
                message: "Return request does not belong to this distributor",
            });
        }

        const item = returnRequest.items.find((item) => item.variant_id.toString() === variantId);

        if (!item) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({ success: false, message: "Variant not found in request" });
        }

        const oldItemStatus = item.status;

        const distributor_stock = await DistributorStock.findOne({
            distributor_id: distributorId,
            variant_id: item.variant_id,
        })
        .populate({
            path: "variant",
            populate: "product",
        })
        .session(session);

        // Allowed transitions (cannot go backwards)
        const allowedTransitions: Record<string, string[]> = {
            pending: ["accepted", "rejected", "insufficient stock"],
            accepted: ["received", "cancelled"],
            received: [],
            rejected: [],
            cancelled: [],
            expired: [],
            "insufficient stock": [],
        };

        let finalStatus = status;

        // If accepted but stock is insufficient
        if (
            (!distributor_stock || distributor_stock.quantity < item.quantity) &&
            status === "accepted"
        ) {
            finalStatus = "insufficient stock";
        }

        const allowedNextStatuses = allowedTransitions[item.status] || [];

        // Prevent invalid/backward update
        if (!allowedNextStatuses.includes(finalStatus)) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `Cannot update item status from ${item.status} to ${finalStatus}. Please reload the page`,
            });
        }

        // Deduct stock only if status becomes received
        if (
            distributor_stock &&
            finalStatus === "received" &&
            distributor_stock.quantity >= item.quantity
        ) {
            distributor_stock.quantity -= item.quantity;
            await distributor_stock.save({ session });
        }

        item.status = finalStatus;

        await returnRequest.save({ session });

        const productName = distributor_stock?.variant?.product?.product_name || "Unknown Product";
        const variantName = distributor_stock?.variant?.variant_name || "Unknown Variant";

        const distributorNotification = await DistributorNotification.create(
        [
            {
            distributor_id: distributor._id,
            return_id: returnId,
            message: `Your return request for ${productName} - ${variantName} has been updated to ${finalStatus}.`,
            },
        ],
        { session }
        );

        const notification = await distributorNotification[0].populate({
        path: "returnRequest",
        populate: [
            {
            path: "items.variant",
            populate: "product",
            },
            { path: "distributor" },
        ],
        });

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(notification, distributor._id.toString());

        await AuditLogService.log({
            action: "RETURN_REQUEST_ITEM_STATUS_UPDATED",
            description: `Return request for ${productName} - ${variantName} has been updated from ${oldItemStatus} to ${finalStatus}.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: { status: oldItemStatus },
            new_values: { status: finalStatus },
        });

        await deleteCache("returnRequests:*");

        return res.status(200).json({
            success: true,
            message: `${productName} - ${variantName} status updated to ${finalStatus}`,
            returnRequest,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const updateAllReturnRequestItems = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const returnId = req.params.return_id;
        const distributorId = req.params.distributor_id;
        const { status } = req.body;

        const distributor = await Distributor.findById(distributorId).session(session);

        if (!distributor) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Distributor not found" });
        }

        const returnRequest = await ReturnRequest.findById(returnId)
        .populate([
            { path: "distributor" },
            {
            path: "items.variant",
            populate: "product",
            },
        ])
        .session(session);

        if (!returnRequest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Return Request not found" });
        }

        if (returnRequest.distributor_id.toString() !== distributor._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: "Return request does not belong to this distributor",
            });
        }

        // Allowed status transitions for return request items
        const allowedTransitions: Record<string, string[]> = {
            pending: ["accepted", "rejected", "insufficient stock"],
            accepted: ["received"],
            received: [],
            rejected: [],
            cancelled: [],
            expired: [],
            "insufficient stock": [],
        };

        // store old values for audit
        const oldItems = returnRequest.items.map((item) => ({
            variant_id: item.variant_id,
            status: item.status,
            quantity: item.quantity,
        }));

        for (const item of returnRequest.items) {
            const distributor_stock = await DistributorStock.findOne({
                distributor_id: distributorId,
                variant_id: item.variant_id,
            }).session(session);

            let finalStatus = status;

            // if not enough stock, override request status
            if (
                (!distributor_stock || distributor_stock.quantity < item.quantity) &&
                item.status === "pending"
            ) {
                finalStatus = "insufficient stock";
            }

            const allowedNextStatuses = allowedTransitions[item.status] || [];

            // prevent backward/invalid updates
            if (!allowedNextStatuses.includes(finalStatus)) {
                await session.abortTransaction();
                session.endSession();

                return res.status(400).json({
                    success: false,
                    message: `Cannot update item (${item.variant_id}) status from "${item.status}" to "${finalStatus}". Please reload the page.`,
                });
            }

            // Deduct stock only when status becomes received
            if (distributor_stock && finalStatus === "received" && distributor_stock.quantity >= item.quantity) {
                distributor_stock.quantity -= item.quantity;
                await distributor_stock.save({ session });
            }

            item.status = finalStatus;
        }

        await returnRequest.save({ session });

        const distributorNotification = await DistributorNotification.create(
        [
            {
            distributor_id: distributor._id,
            return_id: returnId,
            message: `All return request items have been updated to ${status}.`,
            },
        ],
        { session }
        );

        const notification = await distributorNotification[0].populate({
        path: "returnRequest",
        populate: [
            { path: "items.variant", populate: "product" },
            { path: "distributor" },
        ],
        });

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(notification, distributor._id.toString());

        // audit log AFTER commit
        await AuditLogService.log({
            action: "RETURN_REQUEST_ALL_ITEMS_UPDATED",
            description: `All return request items have been updated to ${status}`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: oldItems,
            new_values: returnRequest.items.map((item) => ({
                variant_id: item.variant_id,
                status: item.status,
                quantity: item.quantity,
            })),
        });

        await deleteCache("returnRequests:*");

        return res.status(200).json({
            success: true,
            message: `Return request items successfully updated to "${status}"`,
            returnRequest,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};