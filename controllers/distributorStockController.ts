import { NextFunction, Response, Request } from "express";
import mongoose from "mongoose";
import Variant from "../models/Variant";
import { AuthRequest } from "../types/auth";
import DistributorStock from "../models/DistributorStock";
import StockTransferService from "../services/StockTransferService";
import Distributor from "../models/Distributor";
import AuditLogService from "../services/AuditLogService";

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

        await AuditLogService.log({
            action: "STOCK_TRANSFER",
            description: `Stocks successfully transfered`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: newStocks
        });

        res.status(201).json({
            success: true,
            message: "Stocks sucessfully transfered",
            newStocks,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const getDistributorStocks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    try {
        const search = (req.query.search as string) || "";
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const distributorId = req.params.id;

        const existingDistributor = await Distributor.findById(distributorId);
        if (!existingDistributor) {
            return res.status(404).json({
                success: false,
                message: "Distributor not found",
            });
        }

        const sortBy = (req.query.sortBy as string)

        const order = (req.query.order as string) === "asc" ? 1 : -1;

        const sortStage: any = {};

        if (["variant_name", "sku", "price", "stock"].includes(sortBy)) {
            sortStage[`variant.${sortBy}`] = order;
        } else {
            sortStage[sortBy] = order;
        }

        const basePipeline: any[] = [
        {
            $match: {
            distributor_id: new mongoose.Types.ObjectId(distributorId as string),
            },
        },

        // lookup variant
        {
            $lookup: {
                from: "variants",
                localField: "variant_id",
                foreignField: "_id",
                as: "variant",
            },
        },
        { $unwind: "$variant" },

        // lookup product
        {
            $lookup: {
                from: "products",
                localField: "variant.product_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

        // move product inside variant
        {
            $addFields: {
                "variant.product": "$product",
            },
        },

        // remove root product
        {
            $project: {
                product: 0,
            },
        },
        ];

        if (search) {
        basePipeline.push({
            $match: {
            $or: [
                { "variant.variant_name": { $regex: search, $options: "i" } },
                { "variant.sku": { $regex: search, $options: "i" } },
                { "variant.product.product_name": { $regex: search, $options: "i" } },
            ],
            },
        });
        }

        const countPipeline = [...basePipeline, { $count: "total" }];

        const dataPipeline = [
            ...basePipeline,
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
        ];

        const [stocks, countResult] = await Promise.all([
            DistributorStock.aggregate(dataPipeline),
            DistributorStock.aggregate(countPipeline),
        ]);

        const total = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            distributorStocks: stocks,
        });
    } catch (err) {
        next(err);
    }
};