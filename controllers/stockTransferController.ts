import { NextFunction, Request, Response } from "express";
import StockTransfer from "../models/StockTransfer";

export const getStockTransferLogs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

        const filter: any = {};
        
        if(search){
            filter.$or = [
                { "receiver.distributor_name": { $regex: search, $options: "i" } },
                { "receiver.email": { $regex: search, $options: "i" } },
                { "sender.firstname": { $regex: search, $options: "i" } },
                { "sender.lastname": { $regex: search, $options: "i" } },
                { "sender.email": { $regex: search, $options: "i" } },
            ]
        }
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const total = await StockTransfer.countDocuments(filter);

        const stockTransferLogs = await StockTransfer.find(filter)
            .populate({ path: 'receiver', select: "-password"})
            .populate({ path: 'sender', select: "-password"})
            .populate({ 
                path: 'items',
                populate: 'variant'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            success: true,
            stockTransferLogs,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        });


    }catch(err){
        next(err);
    }
}