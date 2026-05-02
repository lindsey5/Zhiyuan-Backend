import { NextFunction, Request, Response } from "express"
import Distributor from "../models/Distributor"
import { generatePassword } from "../utils/utils";
import { sendAcountDetails } from "../services/emailService";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import DistributorSale from "../models/DistributorSale";
import redisClient, { deleteCache } from "../config/redis";

export const createDistributor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        const existingEmail = await Distributor.findOne({ email: req.body.email, status: 'active' }, null, { session });

        if(existingEmail){
            return res.status(409).json({ message: 'Email already exists' })
        }

        const password = generatePassword(10);

        const parentDistributor = await Distributor.findOne({
            distributor_id: req.body.parent_distributor_id
        })

        if(!parentDistributor && req.body.parent_distributor_id){
            return res.status(404).json({ message: "Parent distributor not found"});
        }

        const payload: any = {
            ...req.body,
            password,
        };

        if (!req.body.parent_distributor_id || req.body.parent_distributor_id === "") {
            delete payload.parent_distributor_id;
        } else if (parentDistributor) {
            payload.parent_distributor_id = parentDistributor._id;
        }

        const distributor = await Distributor.create([payload], { session });

        const success = await sendAcountDetails(distributor[0].email, distributor[0].distributor_name, password);

        if(!success) throw new Error('Failed to create distrubutors');
        
        await session.commitTransaction();
        session.endSession();

        await AuditLogService.log({
            action: "CREATE_DISTRIBUTOR",
            description: `Distributor successfully created.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: distributor
        });

        await deleteCache("distributors:*")

        res.status(201).json({
            success: true,
            message: 'Distributor successfull created',
            distributor
        })

    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err)
    }
}

export const getDistributors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = (req.query.search as string) || "";
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = (req.query.order as string) === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const cacheKey = `distributors:${page}:${limit}:${search}:${sortBy}:${order}`;

        const cachedValue = await redisClient.get(cacheKey);
        
        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const matchQuery: any = {
            status: "active",
            $or: [
                { distributor_name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { distributor_id: { $regex: search, $options: "i" }},
            ]
        };

        const allowedSortFields = [
            "distributor_name",
            "wallet_balance",
            "createdAt",
            "total_stocks",
        ];

        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

        const distributors = await Distributor.aggregate([
            // populate parent distributor
            {
                $lookup: {
                    from: "distributors",
                    localField: "parent_distributor_id",
                    foreignField: "_id",
                    as: "parent_distributor",
                },
            },
            {
                $unwind: {
                    path: "$parent_distributor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $match: matchQuery },
            // stocks
            {
                $lookup: {
                    from: "distributorstocks",
                    localField: "_id",
                    foreignField: "distributor_id",
                    as: "stocks",
                },
            },

            {
                $addFields: {
                    total_stocks: { $sum: "$stocks.quantity" },
                },
            },

            {
                $project: {
                    password: 0,
                    stocks: 0,
                    "parent_distributor.password": 0,
                },
            },

            { $sort: { [sortField]: order } },
            { $skip: skip },
            { $limit: limit },
        ]);

        const totalDistributors = await Distributor.countDocuments(matchQuery);

        const responseData = {
            distributors,
            page,
            limit,
            totalPages: Math.ceil(totalDistributors / limit),
            total: totalDistributors
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData,
        });

    } catch (err) {
        next(err);
    }
};

export const getDownlineDistributors = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor) return res.status(404).json({ success: false, message: 'Distributor not found' });

        const cacheKey = `distributors:downline:${distributor.id}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const downlineDistributors = await Distributor.find({ parent_distributor_id: distributor._id })
            .populate('parent_distributor')
            .select('-password');

        const responseData = {
            downlineDistributors
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData
        })

    } catch (err) {
        next(err);
    }
}

export const deleteDistributorById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const existingDistributor = await Distributor.findById(req.params.id);

        if(!existingDistributor){
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            })
        }

        existingDistributor.set({
            status: 'deleted'
        });
        await existingDistributor.save();
        await deleteCache("distributors:*");

        res.status(200).json({
            success: true,
            message: 'Distributor successfully removed'
        })

    }catch(err){
        next(err)
    }
}

export const getDistributorById = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const distributor = await Distributor.findById(req.params.id).populate("parent_distributor");

        if(!distributor) return res.status(404).json({ success: false, message: 'Distributor not found.'});

        res.status(200).json({
            success: true,
            distributor
        })

    }catch(err){
        next(err)
    }
}

export const getTopDistributors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";

        const sortBy = req.query.sortBy ? String(req.query.sortBy) : "rank";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

        const filter: any = { "distributor.status": "active" };

        if (search) {
            filter.$or = [
                { "distributor.distributor_name": { $regex: search, $options: "i" } },
                { "distributor.email": { $regex: search, $options: "i" } },
                { "distributor.distributor_id": { $regex: search, $options: "i" } },
            ];
        }

        // allowed sorting fields
        const allowedSortFields: any = {
            rank: "rank",
            totalSales: "totalSales",
            totalQuantity: "totalQuantity"
        };

        const sortField = allowedSortFields[sortBy] || "totalQuantity";

        const result = await DistributorSale.aggregate([
            {
                $lookup: {
                    from: "distributors",
                    localField: "seller_id",
                    foreignField: "_id",
                    as: "distributor"
                }
            },
            { $unwind: "$distributor" },
            { $match: filter },

            {
                $group: {
                    _id: "$seller_id",
                    totalSales: { $sum: "$total_amount" },
                    totalQuantity: { $sum: "$quantity" },
                    distributor: { $first: "$distributor" }
                }
            },

            // always compute rank based on totalQuantity
            { $sort: { totalQuantity: -1 } },
            {
                $setWindowFields: {
                    sortBy: { totalQuantity: -1 },
                    output: {
                        rank: { $rank: {} }
                    }
                }
            },

            // apply user sorting after rank is computed
            { $sort: { [sortField]: order } },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                rank: 1,
                                totalSales: 1,
                                totalQuantity: 1,
                                distributor: {
                                    _id: 1,
                                    distributor_id: 1,
                                    parent_distributor_id: 1,
                                    distributor_name: 1,
                                    email: 1,
                                    commission_rate: 1,
                                    wallet_balance: 1
                                }
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const topDistributors = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages,
            topDistributors
        });

    } catch (err) {
        next(err);
    }
};

export const getTotalDistributors = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const totalDistributors = await Distributor.countDocuments({
            status: 'active'
        });

        res.status(200).json({
            success: true,
            totalDistributors
        })

    } catch(err) {
        next(err);
    }
}