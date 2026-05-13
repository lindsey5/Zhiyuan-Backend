import { NextFunction, Request, Response } from "express";
import StockTransfer from "../models/StockTransfer";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";
import { AuthRequest } from "../types/auth";
import DistributorNotification from "../models/DistributorNotification";
import { emitDistributorNotification } from "../sockets/namespaces/distributorNotification.namespace";
import mongoose from "mongoose";
import Variant from "../models/Variant";
import AuditLogService from "../services/AuditLogService";
import Distributor from "../models/Distributor";
import StockTransferService from "../services/StockTransferService";

export const createStockTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const stocks = req.body;
        const distributorId = req.params.id;

        const distributor = await Distributor.findById(distributorId);

        if(!distributor || distributor.status === 'deleted'){
            return res.status(404).json({ success: false, message: "Distributor not found"})
        }

        for (const stock of stocks) {
            const variant = await Variant.findById(stock.variant_id);

            if(!variant) continue;

            if(variant.stock < stock.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${variant.variant_name}. Please reload the page.`
                })
            }

            variant.stock -= stock.quantity;

            await variant.save({ session });
        }

        const stockTransfer = await StockTransferService.logStockTransfer({
            sender_id: req.user._id as string,
            receiver_id: distributorId as string,
            stocks: stocks.map((stock : any) => ({
                variant_id: stock.variant_id.toString(),
                quantity: stock.quantity,
            })),
            session,
        });

        if (!stockTransfer) {
            throw new Error("Failed to log stock transfer");
        }

        await session.commitTransaction();
        session.endSession();

        await AuditLogService.log({
            action: "STOCK_DISTRIBUTION_CREATED",
            description: `A new stock distribution has been created and submitted`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: stockTransfer
        });

        await deleteCache(`products:*`);
        await deleteCache(`variants:*`);
        res.status(201).json({
            success: true,
            message: "Stock distribution request successfully created",
            stockTransfer,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const getStockTransferById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const stockTransfer = await StockTransfer.findById(req.params.id)
        .populate([
            { path: 'sender', select: '-password' },
            { path: 'receiver', select: '-password' },
            { 
                path: 'items', 
                populate: {
                    path: 'variant',
                    populate: 'product'
                }
            }
        ]);

        if(!stockTransfer) return res.status(404).json({ success: false, message: "Stock transfer not found" });

        res.status(200).json({
            success: true,
            stockTransfer
        })

    }catch(err){
        next(err);
    }
}

export const getStockTransferLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status ? String(req.query.status) : "";

        const cacheKey = `stock-transfer-logs:${search}:${page}:${limit}:${startDate}:${endDate}:${status}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const { stockTransferLogs, total } = await StockTransferService.getTransferLogs({
            search,
            limit, 
            skip,
            status,
            startDate,
            endDate
        });

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

export const getMyOwnTransferLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status ? String(req.query.status) : "";

        const cacheKey = `stock-transfer-logs:${req.user._id.toString()}:${search}:${page}:${limit}:${startDate}:${endDate}:${status}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const { stockTransferLogs, total } = await StockTransferService.getTransferLogs({
            search,
            limit, 
            skip,
            startDate,
            endDate,
            status,
            getOwn: true,
            myId: req.user._id
        });

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

export const updateStockTransferLogStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
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

        if(stockTransfer.sender_id?.toString() === req.user._id){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const newStatus = req.body.status;
        const currentStatus = stockTransfer.status;

        if (currentStatus === newStatus) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `The stock transfer status is already "${newStatus}".`,
            });
        }

        // Allowed status transitions (cannot go backwards)
        const allowedTransitions: Record<string, string[]> = {
            pending: ["cancelled", "processing"],
            processing: ["delivered", "cancelled"],
            delivered: ["failed"],
            received: [],
            cancelled: [],
            rejected: [],
            failed: [],
        };

        const allowedNextStatuses = allowedTransitions[currentStatus] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
            success: false,
            message: `Cannot update stock transfer status from ${currentStatus} to ${newStatus}. Please reload the page`,
        });
        }

        const oldStatus = stockTransfer.status;

        // Return stock to main inventory if cancelled/rejected/failed
        if (newStatus === "cancelled" || newStatus === "rejected" || newStatus === "failed") {
            for (const item of stockTransfer.items) {
                const variant = await Variant.findById(item.variant_id).session(session);

                if (!variant) continue;

                variant.stock += item.quantity;
                await variant.save({ session });
            }
        }

        stockTransfer.status = newStatus;
        await stockTransfer.save({ session });

        const message = `Stock distribution status has been updated to ${newStatus}.`;

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
        populate: [
            {
                path: "items",
                populate: {
                    path: "variant",
                    populate: "product",
                },
            },
            { path: 'sender', select: '-password'},
            { path: 'receiver', select: '-password'},
        ]
        });

        await session.commitTransaction();
        session.endSession();

        // emit AFTER commit
        await emitDistributorNotification(notification, stockTransfer.receiver_id.toString());

        await deleteCache("stock-transfer-logs:*");
        await deleteCache("products:*");
        await deleteCache("variants:*");
        await deleteCache("distributor-stocks:*");

        await AuditLogService.log({
            action: "STOCK_DISTRIBUTION_UPDATED",
            description: `A stock distribution has been updated from ${oldStatus} to ${newStatus}`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: { status: oldStatus },
            new_values: { status: newStatus },
        });

        return res.status(200).json({
        success: true,
        message: `Status successfully marked as ${newStatus}`,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};