import { NextFunction, Request, Response } from "express";
import Category from "../database/models/Category";
import { Op } from "sequelize";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";

export const createCategory = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const existingCategory = await Category.findOne({
            where: {
                name: req.body.name,
                status: 'active'
            }
        })

        if(existingCategory){
            return res.status(409).json({
                success: false,
                message: 'Category already exists.'
            })
        }

        const category = await Category.create(req.body);

        await AuditLogService.log({
            action: "CREATE_CATEGORY",
            description: `Category "${category.toJSON().name}" successfully created.`,
            ip_address: req.ip || "",
            role: req?.user?.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: Number(req.user.id),
            old_values: null,
            new_values: category.toJSON()
        });

        res.status(201).json({
            success: true,
            message: 'Category successfully created.',
            category
        })

    }catch(err){
        next(err);
    }
}

export const getCategories = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const search = req.query.search ? String(req.query.search) : "";
        const categories = await Category.findAll({
            where: {
                ...(search && { name: { [Op.like] : `%${search}%`}}),
                status: 'active'
            }
        });

        res.status(200).json({
            success: true,
            categories
        })

    }catch(err){
        next(err);
    }
}

export const updateCategory = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{

        const existingCategory = await Category.findOne({
            where: {
                name: req.body.name,
                status: 'active'
            }
        })

        if(existingCategory){
            return res.status(409).json({
                success: false,
                message: 'Category already exist'
            })
        }

        const category = await Category.findByPk(req.params.id as string);

        if(!category){
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            })
        }

        const oldCategory = category;

        category.set({
            name: req.body.name
        })

        await category.save();

        await AuditLogService.log({
            action: "UPDATE_CATEGORY",
            description: `Category successfully updated.`,
            ip_address: req.ip || "",
            role: req?.user?.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: Number(req.user.id),
            old_values: oldCategory?.toJSON(),
            new_values: category.toJSON()
        });

        res.status(200).json({
            success: true,
            message: 'Category successfully updated',
            category
        })

    }catch(err){
        next(err);
    }
}

export const deleteCategory = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const category = await Category.findByPk(req.params.id as string);

        if(!category){
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            })
        }

        await category.destroy();

        await AuditLogService.log({
            action: "UPDATE_CATEGORY",
            description: `Category "${category.toJSON().name}" successfully deleted.`,
            ip_address: req.ip || "",
            role: req?.user?.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: Number(req.user.id),
            old_values: category.toJSON(),
            new_values: null
        });

        res.status(200).json({
            success: true,
            message: 'Category successfully deleted'
        })

    }catch(err){
        next(err);
    }
}