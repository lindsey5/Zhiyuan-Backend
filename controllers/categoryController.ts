import { NextFunction, Request, Response } from "express";
import Category from "../database/models/Category";
import { Op } from "sequelize";

export const createCategory = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const existingCategory = await Category.findOne({
            where: {
                name: req.body.name
            }
        })

        if(existingCategory){
            return res.status(409).json({
                success: false,
                message: 'Category already exists.'
            })
        }

        const category = await Category.create(req.body);

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
                ...(search && { name: { [Op.like] : `%${search}%`}})
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