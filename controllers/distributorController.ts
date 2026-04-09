import { NextFunction, Request, Response } from "express"
import Distributor from "../models/Distributor"
import { generatePassword } from "../utils/utils";
import { sendAcountDetails } from "../services/emailService";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import DistributorSale from "../models/DistributorSale";

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

        const distributor = await Distributor.create([{
            ...req.body, password, ...(parentDistributor && { parent_distributor_id: parentDistributor._id })
        }], { session});

        const success = await sendAcountDetails(distributor[0].email, distributor[0].distributor_name, password);

        if(!success)throw new Error('Failed to create distrubutors');
        
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
        const id = req.query.id;

        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = (req.query.order as string) === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const matchQuery: any = {
            status: "active",
            $or: [
                { distributor_name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { distributor_id: { $regex: search, $options: "i" }},
            ]
        };

        if(id) matchQuery._id = new mongoose.Types.ObjectId(id as string);

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

        res.status(200).json({
            distributors,
            total: totalDistributors,
            page,
            limit,
            totalPages: Math.ceil(totalDistributors / limit),
        });

    } catch (err) {
        next(err);
    }
};

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
    try{
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const topDistributors = await DistributorSale.aggregate([
        {
            $lookup: {
                from: "distributors",
                localField: "seller_id",
                foreignField: "_id",
                as: "distributor"
            }
        },
        {   $unwind: "$distributor" },
        {   $match: { "distributor.status": "active" } }, 
        {
            $group: {
                _id: "$seller_id",
                    totalSales: { $sum: "$total_amount" },
                    totalQuantity: { $sum: "$quantity" },
                    distributor: { $first: "$distributor" } 
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: limit },
        {
            $project: {
                _id: 0,
                totalSales: 1,
                totalQuantity: 1,
                distributor: {
                    _id: 1,
                    parent_distributor_id: 1,
                    distributor_name: 1,
                    email: 1,
                    commission_rate: 1,
                    wallet_balance: 1,
                }
            }
        }
        ]);

        res.status(200).json({ 
            success: true,
            topDistributors
        })

    }catch(err){
        next(err);
    }
}