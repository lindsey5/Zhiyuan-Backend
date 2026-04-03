import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import Variant from "../models/Variant";
import { AuthRequest } from "../types/auth";
import DistributorStock from "../models/DistributorStock";
import StockTransferService from "../services/StockTransferService";

export const createBulkDistributorStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const stocks = req.body;
        const distributorId = req.params.id;

        const newStocks = [];

        for (const stock of stocks) {
            const variant = await Variant.findById(stock.variant_id);

            if(!variant) continue;

            variant.stock -= stock.quantity;
            await variant.save({ session });

            const existingStock = await DistributorStock.findOne(
                {
                    distributor_id: distributorId,
                    variant_id: stock.variant_id,
                },
                null,
                { session }
            );

            if (existingStock) {
                existingStock.quantity += stock.quantity;

                await existingStock.save({ session });

                newStocks.push(existingStock);
                continue;
            }

            const distributorStock = await DistributorStock.create(
                [{ ...stock, distributor_id: distributorId }],
                { session }
            );

            newStocks.push(distributorStock[0]);
        }

        const success = await StockTransferService.logStockTransfer({
            sender_id: req.user._id as string,
            receiver_id: distributorId as string,
            stocks: stocks.map((stock : any) => ({
                variant_id: stock.variant_id.toString(),
                quantity: stock.quantity,
            })),
            session,
        });

        if (!success) {
            throw new Error("Failed to log stock transfer");
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Distributor stocks created successfully",
            newStocks,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};