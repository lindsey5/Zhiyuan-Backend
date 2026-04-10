import { NextFunction, Request, Response } from "express";
import Variant from "../models/Variant";
import mongoose from "mongoose";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import { deleteFile, uploadBase64 } from "../utils/cloudinary";
import PDFDocument from "pdfkit";

export const getVariants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";
        const category = req.query.category ? String(req.query.category) : "";
        const sortBy = req.query.sortBy ? String(req.query.sortBy) : "variant_name";
        const order = req.query.order && String(req.query.order).toUpperCase() === "DESC" ? -1 : 1;

        // Build filter for variants
        const variantFilter: any = { status: 'active' };
        if (search) {
            variantFilter.$or = [
                { variant_name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { "product.product_name" : { $regex: search, $options: "i" }}
            ];
        }

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $match: variantFilter },
        ];

        if (category) {
            pipeline.push({ $match: { "product.category": category } });
        }

        pipeline.push(
            { $sort: { [sortBy]: order } },
            { $skip: skip },
            { $limit: limit }
        );

        const [variants, totalCount] = await Promise.all([
            Variant.aggregate(pipeline),
            Variant.countDocuments(variantFilter)
                .populate({
                    path: "product",
                    match: { ...(category ? { category } : {}) },
                })
                .exec(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total: totalCount,
            variants,
        });
    } catch (err) {
        next(err);
    }
};

export const downloadVariants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search ? String(req.query.search) : "";
        const category = req.query.category ? String(req.query.category) : "";

        const variantFilter: any = { status: "active" };

        if (search) {
            variantFilter.$or = [
                { variant_name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { "product.product_name": { $regex: search, $options: "i" } },
            ];
        }

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $match: variantFilter },
        ];

        if (category) {
            pipeline.push({ $match: { "product.category": category } });
        }

        const variants = await Variant.aggregate(pipeline);

        // PDF GENERATION
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));

        const pdfBufferPromise = new Promise<Buffer>((resolve) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        // Title
        doc.fontSize(18).text("Zhiyuan Inventory", { align: "center" });
        doc.moveDown(1);

        const startX = 30;
        const pageBottom = 750;

        // Column positions + widths (PRODUCT IS NOW FIRST)
        const columns = {
            product: { x: startX, width: 150 },
            variant: { x: startX + 160, width: 120 },
            sku: { x: startX + 290, width: 80 },
            category: { x: startX + 380, width: 80 },
            stock: { x: startX + 470, width: 40 },
            price: { x: startX + 520, width: 60 },
        };

        // Header
        const drawHeader = () => {
            doc.font("Helvetica-Bold").fontSize(10);

            const y = doc.y;

            doc.text("Product", columns.product.x, y, { width: columns.product.width });
            doc.text("Variant", columns.variant.x, y, { width: columns.variant.width });
            doc.text("SKU", columns.sku.x, y, { width: columns.sku.width });
            doc.text("Category", columns.category.x, y, { width: columns.category.width });
            doc.text("Stock", columns.stock.x, y, { width: columns.stock.width });
            doc.text("Price", columns.price.x, y, { width: columns.price.width });

            doc.moveTo(startX, y + 15).lineTo(570, y + 15).stroke();
            doc.moveDown(1);

            doc.font("Helvetica").fontSize(9);
        };

        drawHeader();

        let rowY = doc.y;

        variants.forEach((variant) => {
            const productName = variant.product?.product_name || "";
            const variantName = variant.variant_name || "";
            const sku = variant.sku || "";
            const categoryName = variant.product?.category || "";
            const stock = String(variant.stock ?? "");
            const price = variant.price.toFixed(2);

            const heights = [
                doc.heightOfString(productName, { width: columns.product.width }),
                doc.heightOfString(variantName, { width: columns.variant.width }),
                doc.heightOfString(sku, { width: columns.sku.width }),
                doc.heightOfString(categoryName, { width: columns.category.width }),
                doc.heightOfString(stock, { width: columns.stock.width }),
                doc.heightOfString(price, { width: columns.price.width }),
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
            doc.text(categoryName, columns.category.x, rowY, { width: columns.category.width });
            doc.text(stock, columns.stock.x, rowY, { width: columns.stock.width });
            doc.text(price, columns.price.x, rowY, { width: columns.price.width });

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
            filename: "Zhiyuan Inventory.pdf",
        });

    } catch (err) {
        next(err);
    }
};

export const updateVariant = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const updatedVariant = req.body;

        const variant = await Variant.findById(req.params.id).session(session);

        if(!variant){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Variant not found',
            })
        }

        const oldValues = variant.toObject();

        if(updatedVariant.image_url && updatedVariant.image_url !== oldValues.image_url){
            if (updatedVariant.thumbnail_url.startsWith("data:image")) {
                const { public_id, secure_url } = await uploadBase64(updatedVariant.image_url);

                updatedVariant.image_public_id = public_id;
                updatedVariant.image_url = secure_url;
            }

        }

        // Update variant fields
        variant.set(updatedVariant);
        await variant.save({ session })

        await session.commitTransaction();
        session.endSession();

        if(oldValues.image_public_id !== variant.image_public_id) await deleteFile(variant.image_public_id)
        
        await AuditLogService.log({
            action: "UPDATE_VARIANT",
            description: `Variant "${variant.variant_name}" successfully updated.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: variant
        });

        res.status(200).json({
            success: true,
            variant,
            message: 'Variant successfully updated'
        })

    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

export const deleteVariant = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const variant = await Variant.findById(req.params.id);
        if(!variant){
            return res.status(404).json({
                success: false,
                message: "Variant not found."
            })
        }
        const oldValues = variant.toObject();
        variant.status = 'deleted';
        variant.save();

        await AuditLogService.log({
            action: "DELETE_VARIANT",
            description: `Variant "${oldValues.variant_name}" successfully deleted.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: null
        })

        res.status(200).json({
            success: true,
            message: 'Variant successfully deleted'
        })

    }catch(err){
        next(err);
    }
}

export const searchVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, ...query } = req.query;

        const filter: any = { ...query };
        if (id !== undefined && id !== "") {
            filter._id = { $ne: new mongoose.Types.ObjectId(id as string) };
        }

        const variant = await Variant.findOne(filter);

        if (!variant || !variant.product_id) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        res.status(200).json({
            success: true,
            variant,
        });
    } catch (err) {
        next(err);
    }
};