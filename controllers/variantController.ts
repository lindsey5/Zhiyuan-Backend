import { NextFunction, Request, Response } from "express";
import Variant from "../models/Variant";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import { deleteFile, uploadBase64 } from "../utils/cloudinary";

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
            variantFilter.$or = [
                { variant_name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
            ];
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

export const updateVariant = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const updatedVariant = req.body;

        const variant = await Variant.findById(req.params.id).session(session);

        if(!variant){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Variant not found',
            })
        }

        const oldValues = variant.toObject();

        if(updatedVariant.image_url && updatedVariant.image_url !== oldValues.image_url){
            if (updatedVariant.thumbnail_url.startsWith("data:image")) {
                const { public_id, secure_url } = await uploadBase64(updatedVariant.image_url);

                updatedVariant.image_public_id = public_id;
                updatedVariant.image_url = secure_url;
            }

        }

        // Update variant fields
        variant.set(updatedVariant);
        await variant.save({ session })

        await session.commitTransaction();
        session.endSession();

        if(oldValues.image_public_id !== variant.image_public_id) await deleteFile(variant.image_public_id)
        
        await AuditLogService.log({
            action: "UPDATE_VARIANT",
            description: `Variant "${variant.variant_name}" successfully updated.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: variant
        });

        res.status(200).json({
            success: true,
            variant,
            message: 'Variant successfully updated'
        })

    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

export const deleteVariant = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const variant = await Variant.findById(req.params.id);
        if(!variant){
            return res.status(404).json({
                success: false,
                message: "Variant not found."
            })
        }
        const oldValues = variant.toObject();
        variant.status = 'deleted';
        variant.save();

        await AuditLogService.log({
            action: "DELETE_VARIANT",
            description: `Variant "${oldValues.variant_name}" successfully deleted.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: null
        })

        res.status(200).json({
            success: true,
            message: 'Variant successfully deleted'
        })

    }catch(err){
        next(err);
    }
}

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