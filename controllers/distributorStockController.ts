import { NextFunction, Response, Request } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../types/auth";
import DistributorStock from "../models/DistributorStock";
import StockTransferService from "../services/StockTransferService";
import Distributor from "../models/Distributor";
import AuditLogService from "../services/AuditLogService";
import PDFDocument from "pdfkit";
import redisClient, { deleteCache } from "../config/redis";

export const createBulkDistributorStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const stocks = req.body;
        const distributorId = req.params.id;

        const distributor = await Distributor.findById(distributorId);

        if(!distributor || distributor.status === 'deleted'){
            return res.status(404).json({ success: false, message: "Distributor not found"})
        }

        const stockTransfer = await StockTransferService.logStockTransfer({
            sender_id: req.user._id as string,
            receiver_id: distributorId as string,
            stocks: stocks.map((stock : any) => ({
                variant_id: stock.variant_id.toString(),
                quantity: stock.quantity,
            })),
            session,
        });

        if (!stockTransfer) {
            throw new Error("Failed to log stock transfer");
        }

        await session.commitTransaction();
        session.endSession();

        await AuditLogService.log({
            action: "STOCK_TRANSFER_REQUEST_CREATED",
            description: `Stock transfer request created successfully.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: null,
            new_values: stockTransfer
        });

        await deleteCache(`distributor-stocks:${distributorId}:*`)

        res.status(201).json({
            success: true,
            message: "Stock transfer request successfully created",
            stockTransfer,
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
        const sortBy = (req.query.sortBy as string)
        const order = (req.query.order as string) === "asc" ? 1 : -1;

        const existingDistributor = await Distributor.findById(distributorId);
        
        if (!existingDistributor) {
            return res.status(404).json({
                success: false,
                message: "Distributor not found",
            });
        }

        const cacheKey = `distributor-stocks:${distributorId}:${page}:${limit}:${search}:${req.query.startDate || ""}:${req.query.endDate || ""}:${order}:${sortBy}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

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

        const responseData = {
            page,
            limit,
            totalPages,
            total,
            distributorStocks: stocks,
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData
        });
    } catch (err) {
        next(err);
    }
};

export const downloadDistributorStocks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const search = (req.query.search as string) || "";
        const distributorId = req.params.id;

        const existingDistributor = await Distributor.findById(distributorId);

        if (!existingDistributor) {
            return res.status(404).json({
                success: false,
                message: "Distributor not found",
            });
        }

        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = (req.query.order as string) === "asc" ? 1 : -1;

        const sortStage: any = {};

        if (["variant_name", "sku", "price", "stock"].includes(sortBy)) {
            sortStage[`variant.${sortBy}`] = order;
        } else {
            sortStage[sortBy] = order;
        }

        const pipeline: any[] = [
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

        // search filter
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "variant.variant_name": { $regex: search, $options: "i" } },
                        { "variant.sku": { $regex: search, $options: "i" } },
                        { "variant.product.product_name": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        // sort (NO PAGINATION)
        pipeline.push({ $sort: sortStage });

        const stocks = await DistributorStock.aggregate(pipeline);

        // ======================
        // PDF GENERATION
        // ======================
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));

        const pdfBufferPromise = new Promise<Buffer>((resolve) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        doc
            .fontSize(16)
            .text(`${existingDistributor.distributor_name} - Stock Report`, { align: "center" });

        doc.moveDown(1);

        const startX = 30;
        const pageBottom = 750;

        const columns = {
            product: { x: startX, width: 160 },
            variant: { x: startX + 170, width: 140 },
            sku: { x: startX + 320, width: 90 },
            price: { x: startX + 420, width: 70 },
            quantity: { x: startX + 500, width: 60 },
        };

        const drawHeader = () => {
            doc.font("Helvetica-Bold").fontSize(9);

            const y = doc.y;

            doc.text("Product", columns.product.x, y, { width: columns.product.width });
            doc.text("Variant", columns.variant.x, y, { width: columns.variant.width });
            doc.text("SKU", columns.sku.x, y, { width: columns.sku.width });
            doc.text("Price", columns.price.x, y, { width: columns.price.width });
            doc.text("Stock", columns.quantity.x, y, { width: columns.quantity.width });

            doc.moveTo(startX, y + 15).lineTo(570, y + 15).stroke();
            doc.moveDown(1);

            doc.font("Helvetica").fontSize(8);
        };

        drawHeader();

        let rowY = doc.y;

        stocks.forEach((stock) => {
            const productName = stock.variant?.product?.product_name || "";
            const variantName = stock.variant?.variant_name || "";
            const sku = stock.variant?.sku || "";
            const price = (stock.variant?.price || 0).toFixed(2);
            const stockQty = String(stock.quantity ?? 0);

            const heights = [
                doc.heightOfString(productName, { width: columns.product.width }),
                doc.heightOfString(variantName, { width: columns.variant.width }),
                doc.heightOfString(sku, { width: columns.sku.width }),
                doc.heightOfString(price, { width: columns.price.width }),
                doc.heightOfString(stockQty, { width: columns.quantity.width }),
            ];

            const rowHeight = Math.max(...heights) + 8;

            if (rowY + rowHeight > pageBottom) {
                doc.addPage();
                drawHeader();
                rowY = doc.y;
            }

            doc.text(productName, columns.product.x, rowY, { width: columns.product.width });
            doc.text(variantName, columns.variant.x, rowY, { width: columns.variant.width });
            doc.text(sku, columns.sku.x, rowY, { width: columns.sku.width });
            doc.text(price, columns.price.x, rowY, { width: columns.price.width });
            doc.text(stockQty, columns.quantity.x, rowY, { width: columns.quantity.width });

            doc
                .moveTo(startX, rowY + rowHeight - 3)
                .lineTo(570, rowY + rowHeight - 3)
                .strokeOpacity(0.2)
                .stroke()
                .strokeOpacity(1);

            rowY += rowHeight;
        });

        doc.end();

        const pdfBuffer = await pdfBufferPromise;
        const base64Data = pdfBuffer.toString("base64");

        res.status(200).json({
            data: base64Data,
            filename: `${existingDistributor.distributor_name} - Stocks.pdf`,
        });

    } catch (err) {
        next(err);
    }
};

export const getTotalDistributorStocks = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor){
            return res.status(404).json({ success: false, message: "Distributor not found." });
        }

        const cacheKey = `distributor-stocks:${distributor.id}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const filter : any = {
            distributor_id: distributor._id
        }

        const result = await DistributorStock.aggregate([
            { $match: filter },
            { $group: { _id: null, totalStocks: { $sum: "$quantity" }}}
        ])

        const totalStocks = result[0]?.totalStocks || 0;


        const responseData = {
            totalStocks
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData
        })

    }catch(err){
        next(err);
    }
}