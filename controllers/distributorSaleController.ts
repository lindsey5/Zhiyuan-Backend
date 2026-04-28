import { NextFunction, Request, Response } from "express";
import DistributorSale from "../models/DistributorSale";
import { formatDate, setEndDate, setStartDate } from "../utils/utils";
import mongoose from "mongoose";
import Distributor from "../models/Distributor";
import DistributorSaleService from "../services/DistributorSaleService";
import PDFDocument from "pdfkit";
import redisClient from "../config/redis";

export const getAllDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";

        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const cacheKey = `distributor-sales:${page}:${limit}:${search}:${startDate}:${endDate}:${order}:${sortBy}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue),
            });
        }

        const filter: any = {};

        if (search) {
            filter.$or = [
                { "product.product_name": { $regex: search, $options: "i" } },
                { "variant.variant_name": { $regex: search, $options: "i" } },
                { "variant.sku": { $regex: search, $options: "i" } },
                { "seller.distributor_name": { $regex: search, $options: "i" } },
                { "seller.email": { $regex: search, $options: "i" } },
                { "seller.distributor_id": { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const pipeline = [
            {
                $lookup: {
                    from: "variants",
                    localField: "variant_id",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },

            {
                $lookup: {
                    from: "products",
                    localField: "variant.product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },

            {
                $lookup: {
                    from: "distributors",
                    localField: "seller_id",
                    foreignField: "_id",
                    as: "seller",
                },
            },
            { $unwind: "$seller" },

            {
                $lookup: {
                    from: "distributors",
                    localField: "seller.parent_distributor_id",
                    foreignField: "_id",
                    as: "parent_distributor",
                },
            },
            {
                $unwind: {
                    path: "$parent_distributor",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const [distributorSales, totalResult] = await Promise.all([
            DistributorSale.aggregate([
                ...pipeline,
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit },
            ]),

            DistributorSale.aggregate([
                ...pipeline,
                { $match: filter },
                { $count: "total" },
            ]),
        ]);

        const total = totalResult[0]?.total || 0;

        const responseData = {
            distributorSales,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60,
        });

        return res.status(200).json({
            success: true,
            ...responseData,
        });
    } catch (err) {
        next(err);
    }
};

export const getDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";

        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const distributor = await Distributor.findById(req.params.id);

        if(!distributor || distributor.status === "deleted"){
            return res.status(404).json({
                success: false,
                message: 'Distributor not found.'
            })
        }

        const cacheKey = `distributor-sales:${distributor.id}:${page}:${limit}:${search}:${startDate}:${endDate}:${order}:${sortBy}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const filter: any = { seller_id: new mongoose.Types.ObjectId(req.params.id as string) };

        if (search) {
            filter.$or = [
                { "product.product_name": { $regex: search, $options: "i" } },
                { "variant.variant_name": { $regex: search, $options: "i" } },
                { "variant.sku": { $regex: search, $options: "i" } },
                { "seller.distributor_name": { $regex: search, $options: "i" } },
                { "seller.email": { $regex: search, $options: "i" } },
                { "seller.distributor_id": { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const pipeline = [
            {
                $lookup: {
                    from: "variants",
                    localField: "variant_id",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },

            {
                $lookup: {
                    from: "products",
                    localField: "variant.product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },

            {
                $lookup: {
                    from: "distributors",
                    localField: "seller_id",
                    foreignField: "_id",
                    as: "seller",
                },
            },
            { $unwind: "$seller" },

            {
                $lookup: {
                    from: "distributors",
                    localField: "seller.parent_distributor_id",
                    foreignField: "_id",
                    as: "parent_distributor",
                },
            },
            {
                $unwind: {
                    path: "$parent_distributor",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const [distributorSales, totalResult] = await Promise.all([
            DistributorSale.aggregate([
                ...pipeline,
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit },
            ]),

            DistributorSale.aggregate([
                ...pipeline,
                { $match: filter },
                { $count: "total" },
            ]),
        ]);

        const total = totalResult[0]?.total || 0;

        const responseData = {
            distributorSales,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60,
        });

        return res.status(200).json({
            success: true,
            ...responseData,
        });

    } catch (err) {
        next(err);
    }
}

export const downloadDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search?.toString() || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const distributor = await Distributor.findById(req.params.id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: "Distributor not found",
            });
        }

        const filter: any = { seller_id: distributor._id };

        if (search) {
            filter.$or = [
                { "variant.variant_name": { $regex: search, $options: "i" } },
                { "variant.sku": { $regex: search, $options: "i" } },
                { "product.product_name": { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const distributorSalesData = await DistributorSale.aggregate([
            {
                $lookup: {
                    from: "variants",
                    localField: "variant_id",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },
            {
                $lookup: {
                    from: "products",
                    localField: "variant.product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $match: filter },
            { $sort: { createdAt: -1 } },
        ]);

        // PDF GENERATION
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));

        const pdfBufferPromise = new Promise<Buffer>((resolve) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        // Title
        doc.fontSize(16).text(`${distributor.distributor_name} - Sales Report`, { align: "center" });
        doc.moveDown(1);

        const startX = 30;
        const pageBottom = 750;

        // Columns (Product + Variant separated)
        const columns = {
            product: { x: startX, width: 140 },
            variant: { x: startX + 145, width: 120 },
            sku: { x: startX + 270, width: 80 },
            qty: { x: startX + 355, width: 40 },
            total: { x: startX + 400, width: 80 },
            soldAt: { x: startX + 485, width: 85 },
        };

        const drawHeader = () => {
            doc.font("Helvetica-Bold").fontSize(9);

            const y = doc.y;

            doc.text("Product", columns.product.x, y, { width: columns.product.width });
            doc.text("Variant", columns.variant.x, y, { width: columns.variant.width });
            doc.text("SKU", columns.sku.x, y, { width: columns.sku.width });
            doc.text("Qty", columns.qty.x, y, { width: columns.qty.width });
            doc.text("Total", columns.total.x, y, { width: columns.total.width });
            doc.text("Sold At", columns.soldAt.x, y, { width: columns.soldAt.width });

            doc.moveTo(startX, y + 15).lineTo(570, y + 15).stroke();
            doc.moveDown(1);

            doc.font("Helvetica").fontSize(8);
        };

        drawHeader();

        let rowY = doc.y;

        distributorSalesData.forEach((sale) => {
            const productName = sale.product?.product_name || "";
            const variantName = sale.variant?.variant_name || "";
            const sku = sale.variant?.sku || "";
            const qty = String(sale.quantity ?? "");
            const total = sale.total_amount.toFixed(2);
            const soldAt = formatDate(sale.createdAt);

            const heights = [
                doc.heightOfString(productName, { width: columns.product.width }),
                doc.heightOfString(variantName, { width: columns.variant.width }),
                doc.heightOfString(sku, { width: columns.sku.width }),
                doc.heightOfString(qty, { width: columns.qty.width }),
                doc.heightOfString(total, { width: columns.total.width }),
                doc.heightOfString(soldAt, { width: columns.soldAt.width }),
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
            doc.text(qty, columns.qty.x, rowY, { width: columns.qty.width });
            doc.text(total, columns.total.x, rowY, { width: columns.total.width });
            doc.text(soldAt, columns.soldAt.x, rowY, { width: columns.soldAt.width });

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
            filename: `${distributor.distributor_name} - Sales.pdf`,
        });

    } catch (err) {
        next(err);
    }
};

export const downloadAllDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search?.toString() || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const filter: any = {};

        if (search) {
            filter.$or = [
                { "seller.distributor_name": { $regex: search, $options: "i" } },
                { "seller.distributor_id": { $regex: search, $options: "i" } },
                { "variant.variant_name": { $regex: search, $options: "i" } },
                { "variant.sku": { $regex: search, $options: "i" } },
                { "product.product_name": { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const distributorSalesData = await DistributorSale.aggregate([
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
            { $unwind: "$product" },

            {
                $lookup: {
                    from: "distributors",
                    localField: "seller_id",
                    foreignField: "_id",
                    as: "seller",
                },
            },
            { $unwind: "$seller" },

            { $match: filter },
            { $sort: { createdAt: -1 } },
        ]);

        // PDF GENERATION
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));

        const pdfBufferPromise = new Promise<Buffer>((resolve) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        // Title
        doc.fontSize(16).text("Distributors - Sales Report", { align: "center" });
        doc.moveDown(1);

        const startX = 30;
        const pageBottom = 750;

        // UPDATED columns (Product + Variant)
        const columns = {
            distributorId: { x: startX, width: 55 },
            distributor: { x: startX + 60, width: 90 },
            product: { x: startX + 155, width: 90 },
            variant: { x: startX + 250, width: 90 },
            sku: { x: startX + 345, width: 60 },
            qty: { x: startX + 410, width: 30 },
            total: { x: startX + 445, width: 60 },
            soldAt: { x: startX + 510, width: 60 },
        };

        const drawHeader = () => {
            doc.font("Helvetica-Bold").fontSize(8);

            const y = doc.y;

            doc.text("Dist ID", columns.distributorId.x, y, { width: columns.distributorId.width });
            doc.text("Distributor", columns.distributor.x, y, { width: columns.distributor.width });
            doc.text("Product", columns.product.x, y, { width: columns.product.width });
            doc.text("Variant", columns.variant.x, y, { width: columns.variant.width });
            doc.text("SKU", columns.sku.x, y, { width: columns.sku.width });
            doc.text("Qty", columns.qty.x, y, { width: columns.qty.width });
            doc.text("Total", columns.total.x, y, { width: columns.total.width });
            doc.text("Sold At", columns.soldAt.x, y, { width: columns.soldAt.width });

            doc.moveTo(startX, y + 15).lineTo(570, y + 15).stroke();
            doc.moveDown(1);

            doc.font("Helvetica").fontSize(7.5);
        };

        drawHeader();

        let rowY = doc.y;

        distributorSalesData.forEach((sale) => {
            const distributorId = sale.seller?.distributor_id || "";
            const distributorName = sale.seller?.distributor_name || "";
            const productName = sale.product?.product_name || "";
            const variantName = sale.variant?.variant_name || "";
            const sku = sale.variant?.sku || "";
            const qty = String(sale.quantity ?? "");
            const total = sale.total_amount.toFixed(2);
            const soldAt = formatDate(sale.createdAt);

            const heights = [
                doc.heightOfString(distributorId, { width: columns.distributorId.width }),
                doc.heightOfString(distributorName, { width: columns.distributor.width }),
                doc.heightOfString(productName, { width: columns.product.width }),
                doc.heightOfString(variantName, { width: columns.variant.width }),
                doc.heightOfString(sku, { width: columns.sku.width }),
                doc.heightOfString(qty, { width: columns.qty.width }),
                doc.heightOfString(total, { width: columns.total.width }),
                doc.heightOfString(soldAt, { width: columns.soldAt.width }),
            ];

            const rowHeight = Math.max(...heights) + 8;

            if (rowY + rowHeight > pageBottom) {
                doc.addPage();
                drawHeader();
                rowY = doc.y;
            }

            doc.text(distributorId, columns.distributorId.x, rowY, { width: columns.distributorId.width });
            doc.text(distributorName, columns.distributor.x, rowY, { width: columns.distributor.width });
            doc.text(productName, columns.product.x, rowY, { width: columns.product.width });
            doc.text(variantName, columns.variant.x, rowY, { width: columns.variant.width });
            doc.text(sku, columns.sku.x, rowY, { width: columns.sku.width });
            doc.text(qty, columns.qty.x, rowY, { width: columns.qty.width });
            doc.text(total, columns.total.x, rowY, { width: columns.total.width });
            doc.text(soldAt, columns.soldAt.x, rowY, { width: columns.soldAt.width });

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
            filename: "Distributors - Sales.pdf",
        });

    } catch (err) {
        next(err);
    }
};

export const getDistributorSalesToday = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-sales:${distributor?.id}:today`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "today"
        })

        const responseData = { sales };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-sales:${distributor?.id}:this-month`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisMonth"
        })

        const responseData = { sales };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisWeek = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-sales:${distributor?.id}:this-week`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisWeek"
        })

        const responseData = { sales };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisYear = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-sales:${distributor?.id}:this-year`;
        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisYear"
        })
        
        const responseData = { sales };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldToday = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }
        const cacheKey = `distributor-items-sold:${distributor?.id}:today`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'today'
        })

        const responseData = { totalQuantity };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })
        
    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisWeek = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

       const cacheKey = `distributor-items-sold:${distributor?.id}:this-week`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisWeek'
        })

        
        const responseData = { totalQuantity };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-items-sold:${distributor?.id}:this-month`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisMonth'
        })

        
        const responseData = { totalQuantity };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisYear = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-items-sold:${distributor?.id}:this-year`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisYear'
        })
        
        const responseData = { totalQuantity };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData });

    }catch(err){
        next(err);
    }
}

export const getDistributorMonthlySales = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-sales:${distributor?.id}:${year}:monthly:`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const monthlySales = await DistributorSaleService.getMonthlySalesByYear(year, distributor?.id);

        const responseData = { 
            monthlySales,
            year
         };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldPerMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const cacheKey = `distributor-items-sold:${distributor?.id}:${year}:monthly`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }
        const itemsSoldPerMonth = await DistributorSaleService.getItemsSoldPerMonthByYear(year, distributor?.id);

        const responseData = { itemsSoldPerMonth, year };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({ success: true, ...responseData })
    }catch(err){
        next(err);
    }
}