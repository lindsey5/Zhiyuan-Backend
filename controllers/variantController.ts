import { NextFunction, Request, Response } from "express";
import Variant from "../models/Variant";
import mongoose from "mongoose";

export const getVariants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";
        const category = req.query.category ? String(req.query.category) : "";
        const sortBy = req.query.sortBy ? String(req.query.sortBy) : "variant_name";
        const order = req.query.order && String(req.query.order).toUpperCase() === "DESC" ? -1 : 1;

        // Build filter for variants
        const variantFilter: any = { status: 'active' };
        if (search) {
            variantFilter.$text = { $search: search }
        }

        const [variants, totalCount] = await Promise.all([
            Variant.find(variantFilter)
                .populate({
                    path: "product",
                    match: { ...(category ? { category } : {}) },
                })
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            Variant.countDocuments(variantFilter)
                .populate({
                    path: "product",
                    match: { ...(category ? { category } : {}) },
                })
                .exec(),
        ]);


        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total: totalCount,
            variants,
        });
    } catch (err) {
        next(err);
    }
};

export const searchVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, ...query } = req.query;

        const filter: any = { ...query };
        if (id !== undefined && id !== "") {
            filter._id = { $ne: new mongoose.Types.ObjectId(id as string) };
        }

        const variant = await Variant.findOne(filter);

        if (!variant || !variant.product_id) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        res.status(200).json({
            success: true,
            variant,
        });
    } catch (err) {
        next(err);
    }
};