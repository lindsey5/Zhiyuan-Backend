import { NextFunction } from "express";
import { Response } from "express";
import { AuthRequest } from "../types/auth";
import SponsoredItem from "../models/SponsoredItem";
import Variant from "../models/Variant";
import mongoose from "mongoose";

export const createBulkSponsoredItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    
    try{
        session.startTransaction();

        const { newSponsoredItems } = req.body;

        for(const item of newSponsoredItems){
            const variant = await Variant.findById(item.variant_id);

            if(!variant) return res.status(404).json({ success: false, message: `Variant id doesn't exist: ${item.variant_id}` });

            if(variant.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for variant ${item.variant_id}` });
            
            variant.stock -= item.quantity;
            await variant.save({ session });
        }

        const sponsoredItems = await SponsoredItem.insertMany(newSponsoredItems, { session });

        await session.commitTransaction();
        session.endSession();

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
