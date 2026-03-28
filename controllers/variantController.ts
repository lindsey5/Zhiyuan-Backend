import { NextFunction, Request, Response } from "express";
import { Product, Variant } from '../database/models/index';
import { Op } from "sequelize";

export const getVariants = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";
        const category = req.query.category ? String(req.query.category) : "";
        
        const sortBy = req.query.sortBy ? String(req.query.sortBy) : "variant_name";
        const order =
        req.query.order && String(req.query.order).toUpperCase() === "DESC"
            ? "DESC"
            : "ASC";

        const whereCondition : any = {}

        if(search){
            whereCondition[Op.or] = [
                { variant_name: { [Op.like] : `%${search}%`} },
                { sku: { [Op.like] : `%${search}%`} },
                { '$product.product_name$' : { [Op.like] : `%${search}%`} }
            ]
        }

        if(category){
            whereCondition["$product.category$"] = category
        }

        const includeProduct: any = {
            model: Product,
            as: "product",
            where: {
                status: 'active'
            }
        };
        
        const total = await Variant.count({
            where: whereCondition,
            include: [includeProduct],
        });

        const variants = await Variant.findAll({
            where: whereCondition,
            include: [includeProduct],
            order: [[sortBy, order]],
            limit,
            offset,
            subQuery: false,
        })

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            variants
        })
        
    }catch(err){
        next(err);
    }
}

export const searchVariant = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { id, ...query } = req.query;
        const variant = await Variant.findOne({
            where: {
                ...query,
                ...(id !== undefined && id !== "" && {
                    id: {
                        [Op.ne]: Number(id),
                    },
                }),
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: [],
                    where: {
                        status: 'active'
                    }
                }
            ]
        })
        if(!variant){
            return res.status(404).json({
                success: false,
                message: 'Variant not found'
            })
        }

        res.status(200).json({
            success: true,
            variant
        })

    }catch(err){
        next(err);
    }
}