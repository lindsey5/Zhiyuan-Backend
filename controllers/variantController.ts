import { NextFunction, Request, Response } from "express";
import { Product, Variant } from '../database/models/index';
import { Op } from "sequelize";

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