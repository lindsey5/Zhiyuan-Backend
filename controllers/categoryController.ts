import { Request, Response, NextFunction } from "express";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import Category from "../models/Category";
import redisClient, { deleteCache } from "../config/redis";

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const existingCategory = await Category.findOne({
            name: req.body.name,
            status: "active",
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists.",
            });
        }

        const category = new Category(req.body);
        await category.save();

        await AuditLogService.log({
            action: "CREATE_CATEGORY",
            description: `Category "${category.name}" successfully created.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "LOW",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: category,
        });

        await deleteCache("categories:*")

        res.status(201).json({
            success: true,
            message: "Category successfully created.",
            category,
        });
    } catch (err) {
        next(err);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search ? String(req.query.search) : "";

        const cacheKey = `categories:${search}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const categories = await Category.find({
            ...(search ? { name: { $regex: search, $options: "i" } } : {}),
            status: "active",
        }).sort({ name: 1 });

        await redisClient.set(cacheKey, JSON.stringify({ categories }))

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const existingCategory = await Category.findOne({
            name: req.body.name,
            status: "active",
            _id: { $ne: req.params.id },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        const oldCategory = category;

        category.name = req.body.name;
        await category.save();

        await AuditLogService.log({
            action: "UPDATE_CATEGORY",
            description: `Category successfully updated.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldCategory,
            new_values: category,
        });

        await deleteCache("categories:*")

        res.status(200).json({
            success: true,
            message: "Category successfully updated",
            category,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        await category.deleteOne();

        await AuditLogService.log({
            action: "DELETE_CATEGORY",
            description: `Category "${category.name}" successfully deleted.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: category,
            new_values: null,
        });

        await deleteCache("categories:*")

        res.status(200).json({
            success: true,
            message: "Category successfully deleted",
        });
    } catch (err) {
        next(err);
    }
};