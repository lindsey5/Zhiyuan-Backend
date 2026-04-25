import { Request, Response, NextFunction } from "express";
import Distributor from "../models/Distributor";
import CommissionLog from "../models/CommissionLog";
import redisClient from "../config/redis";
import { setEndDate, setStartDate } from "../utils/utils";

export const getCommissionsPerMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const distributor = await Distributor.findById(req.params.id);

        const cacheKey = `commissionsPerMonth:${year}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                source: "redis-cache",
                ...JSON.parse(cachedValue)
            });
        }
    
        const match: any = {
            createdAt: {
                $gte: new Date(year, 0, 1, 0, 0, 0, 0),
                $lte: new Date(year, 11, 31, 23, 59, 59, 999),
            },
            receiver_id: distributor?._id
        };

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const result = await CommissionLog.aggregate([
            { $match: match },
            {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalCommission: { $sum: "$commission_amount" },
            },
            },
            {
            $project: {
                _id: 0,
                month: "$_id.month",
                totalCommission: 1,
            },
            },
            { $sort: { month: 1 } },
        ]);

        // Default Jan-Dec with 0
        const commissionsPerMonth = monthNames.map((name) => ({
            month: name,
            totalCommission: 0,
        }));

        // Fill actual values
        result.forEach((item) => {
            commissionsPerMonth[item.month - 1].totalCommission = item.totalCommission;
        });

        const responseData = {
            commissionsPerMonth,
            year
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        })

        res.status(200).json({
            success: true,
            ...responseData
        })

    }catch(err){
        next(err);
    }
}

export const getCommissions = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const skip = (page - 1) * limit;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const distributor = await Distributor.findById(req.params.distributor_id);

        if(!distributor){
            return res.status(404).json({ success: false, message: "Distributor not found" });
        }

        const filter : any = { receiver_id: distributor._id }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const [commissions, total] = await Promise.all([
            CommissionLog.find(filter).populate([
                { 
                    path: 'sales',
                    populate: [
                        {
                            path: 'variant',
                            populate: 'product'
                        },
                        { path: "seller" }
                    ]
                },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            CommissionLog.countDocuments(filter)
        ])

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            commissions
        });

    }catch(err){
        next(err);
    }
}