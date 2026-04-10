import { NextFunction, Request } from "express";
import { Response } from "express";
import { AuthRequest } from "../types/auth";
import SponsoredItem from "../models/SponsoredItem";
import Variant from "../models/Variant";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { setEndDate, setStartDate } from "../utils/utils";

export const createBulkSponsoredItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    
    try{
        session.startTransaction();

        const { newSponsoredItems } = req.body;

        for(const item of newSponsoredItems){
            const variant = await Variant.findById(item.variant_id);

            if(!variant) return res.status(404).json({ success: false, message: `Variant id doesn't exist: ${item.variant_id}` });

            if(variant.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for variant ${variant.variant_name}` });
            
            variant.stock -= item.quantity;
            await variant.save({ session });
        }

        const sponsoredItems = await SponsoredItem.insertMany(newSponsoredItems, { session });

        await session.commitTransaction();
        session.endSession();

        await AuditLogService.log({
            action: "CREATE_SPONSORED_ITEMS",
            description: `${sponsoredItems.length} new sponsored items created`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            old_values: null,
            new_values: sponsoredItems
        });

        res.status(201).json({
            success: true,
            message: "New sponsored items successfully recorded.",
            sponsoredItems
        })
        
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

export const getSponsoredItems = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const filter: any = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        if(search){
            filter.$or = [
                { "product.product_name" : { $regex: search, $options: "i" } },
                { "variant.variant_name" : { $regex: search, $options: "i" } },
                { "variant.sku" : { $regex: search, $options: "i" } },
            ]
        }

        const [sponsoredItems, total] = await Promise.all([
            SponsoredItem.aggregate([
                {
                    $lookup: {
                        from: "variants",
                        localField: "variant_id",
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
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit }
            ]),
            SponsoredItem.countDocuments(filter),
        ])

        res.status(200).json({
            success: true,
            sponsoredItems,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        });

    }catch(err){
        next(err);
    }
}