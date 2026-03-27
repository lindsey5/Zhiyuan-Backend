import { NextFunction, Request, Response } from "express";
import { Variant } from '../database/models/index';

export const searchVariant = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const variant = await Variant.findOne({
            where: {
                ...(req.query)
            }
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