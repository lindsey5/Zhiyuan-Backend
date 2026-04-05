import { NextFunction, Request, Response } from "express";
import { deleteFiles, uploadBase64, uploadFile } from "../utils/cloudinary";
import Variant from "../models/Variant";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";
import Category from "../models/Category";
import Product from "../models/Product";
import mongoose from "mongoose";

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const uploadedPublicIds: string[] = [];

    try {
        // Check if category exists
        const existingCategory = await Category.findOne({ 
            name: req.body.category, 
            status: 'active' 
        });

        if (!existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }

        // Parse variants if needed
        const variants = typeof req.body.variants === 'string'
            ? JSON.parse(req.body.variants)
            : req.body.variants;

        const files = req.files as {
            thumbnail?: Express.Multer.File[];
            variant_images?: Express.Multer.File[];
        };

        const thumbnail = files.thumbnail?.[0];
        const variantImages = files.variant_images || [];

        if (!thumbnail) throw new Error("Product thumbnail is required");
        if (variantImages.length === 0) throw new Error("At least one variant image is required");
        if (variants.length !== variantImages.length) throw new Error(
            `Number of variants (${variants.length}) does not match number of variant images (${variantImages.length})`
        );

        // Upload thumbnail
        const { public_id: thumbnailPublicId, secure_url: thumbnailUrl } = await uploadFile(thumbnail.buffer);
        uploadedPublicIds.push(thumbnailPublicId);

        // Upload variant images
        const variantImageUrls = await Promise.all(
            variantImages.map(async (variantImage) => {
                const uploadedImage = await uploadFile(variantImage.buffer);
                uploadedPublicIds.push(uploadedImage.public_id);

                return {
                    public_id: uploadedImage.public_id,
                    secure_url: uploadedImage.secure_url
                };
            })
        );

        // Create product
        const product = new Product({
            product_name: req.body.product_name,
            description: req.body.description,
            thumbnail_public_id: thumbnailPublicId,
            thumbnail_url: thumbnailUrl,
            category: req.body.category,
        });


        const newVariants = await Variant.insertMany(variants.map((variant: any, i: number) => ({
            product_id: product._id,
            ...variant,
            image_url: variantImageUrls[i].secure_url,
            image_public_id: variantImageUrls[i].public_id
        })))
        await product.save();

        // Audit log
        await AuditLogService.log({
            action: "CREATE_PRODUCT",
            description: `Product "${req.body.product_name}" successfully created.`,
            ip_address: req.ip || "",
            role: req?.user?.role.name || "N/A",
            severity: "LOW",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: null,
            new_values: {
                ...product.toObject(),
                variants: newVariants
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (err: any) {
        // Rollback uploaded images if error occurs
        if (uploadedPublicIds.length > 0) {
            try {
                await deleteFiles(uploadedPublicIds);
            } catch (error) {
                console.error("Failed to rollback uploaded images:", error);
            }
        }

        next(err);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";
        const categories = req.query.categories ? String(req.query.categories) : "";
        const category = req.query.category ? String(req.query.category) : "";

        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

        const sortBy = req.query.sortBy ? String(req.query.sortBy) : "product_name";
        const order = req.query.order && String(req.query.order).toUpperCase() === "DESC" ? -1 : 1;

        const categoriesArr = categories
            ? categories.split(",").map((c) => c.trim()).filter((c) => c !== "")
            : [];

        // Build main product filter
        const filter: any = { status: "active" };

        if (search) {
            filter.product_name = { $regex: search, $options: "i" };
        }

        if (categoriesArr.length > 0) {
            filter.category = { $in: categoriesArr };
        }

        if (category) {
            filter.category = category;
        }

        // Count total products
        const total = await Product.countDocuments(filter);

        // Build aggregate pipeline to include minPrice from variants
        const pipeline: any[] = [
            { $match: filter },
            {
                $lookup: {
                    from: "variants",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "variants",
                    pipeline: [{ $match: { status: "active" } }],
                },
            },
            {
                $addFields: {
                    minPrice: { $min: "$variants.price" },
                },
            },
        ];

        if (minPrice !== null || maxPrice !== null) {
            const priceMatch: any = {};

            if (minPrice !== null) priceMatch.$gte = minPrice;
            if (maxPrice !== null) priceMatch.$lte = maxPrice;

            pipeline.push({
                $match: {
                    minPrice: priceMatch,
                },
            });
        }

        // Apply sorting
        if (sortBy === "price") {
            pipeline.push({ $sort: { minPrice: order } });
        } else {
            pipeline.push({ $sort: { [sortBy]: order } });
        }

        // Pagination
        pipeline.push({ $skip: skip }, { $limit: limit });

        const products = await Product.aggregate(pipeline);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            products,
        });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: "variants", 
                match: { status: "active" }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id).populate("variants");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }
        const oldValues = product.toObject();

        // Mark as deleted
        product.status = "deleted";

        await product.save();

        await Variant.updateMany(
            { product_id: product._id },
            { $set: { status: 'deleted' }}
        )

        // Log the action
        await AuditLogService.log({
            action: "DELETE_PRODUCT",
            description: `Product "${oldValues.product_name}" successfully deleted.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: null
        });

        return res.status(200).json({
            success: true,
            message: "Product successfully deleted."
        });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const uploadedPublicIds: string[] = [];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate category
        const existingCategory = await Category.findOne({
            name: req.body.category,
            status: "active"
        }).session(session);

        if (!existingCategory) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Category does not exist"
            });
        }

        // Fetch product
        const product = await Product.findById(req.params.id).populate("variants").session(session);
        if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const oldValues = product.toObject();
        const oldVariants = oldValues?.variants || [];
        const { variants, ...updatedProduct } = req.body;

        if (!variants || !Array.isArray(variants)) {
            throw new Error("Variants must be an array");
        }

        const imagesToDelete: string[] = [];

        // UPDATE THUMBNAIL
        if (updatedProduct.thumbnail_url && updatedProduct.thumbnail_url !== oldValues.thumbnail_url) {
            if (updatedProduct.thumbnail_url.startsWith("data:image")) {
                const { public_id, secure_url } = await uploadBase64(updatedProduct.thumbnail_url);
                uploadedPublicIds.push(public_id);
                if (oldValues.thumbnail_public_id) imagesToDelete.push(oldValues.thumbnail_public_id);

                updatedProduct.thumbnail_public_id = public_id;
                updatedProduct.thumbnail_url = secure_url;
            }
        }

        // Update product fields
        product.set(updatedProduct);
        await product.save({ session });

        // Update/create variants
        const updatedVariants = await Promise.all(
            variants.map(async (variant) => {
                let existingVariant: any = null;

                if (variant._id) {
                    existingVariant = await Variant.findById(variant._id).session(session);
                }

                if (existingVariant) {
                    if (variant.image_url?.startsWith("data:image") && variant.image_url !== existingVariant.image_url) {
                        const { public_id, secure_url } = await uploadBase64(variant.image_url);
                        uploadedPublicIds.push(public_id);
                        if (existingVariant.image_public_id) imagesToDelete.push(existingVariant.image_public_id);

                        variant.image_public_id = public_id;
                        variant.image_url = secure_url;
                    }
                    existingVariant.set(variant);
                    await existingVariant.save({ session });
                    return existingVariant;
                }

                // Create new variant
                let newImageUrl = variant.image_url;
                let newImagePublicId = "";

                if (variant.image_url.startsWith("data:image")) {
                    const { public_id, secure_url } = await uploadBase64(variant.image_url);
                    uploadedPublicIds.push(public_id);
                    newImagePublicId = public_id;
                    newImageUrl = secure_url;
                }

                const newVariant = await Variant.create([{
                    product_id: product._id,
                    variant_name: variant.variant_name,
                    price: variant.price,
                    stock: variant.stock,
                    sku: variant.sku,
                    image_public_id: newImagePublicId,
                    image_url: newImageUrl
                }], { session });

                return newVariant[0];
            })
        );

        // Delete removed variants
        const incomingIds = variants.filter(v => v._id).map(v => v._id);
        for (const oldVariant of oldVariants) {
            if (!incomingIds.includes(String(oldVariant._id))) {
                await Variant.updateOne({ _id: oldVariant._id}, { $set: { status: 'deleted'}}).session(session);
            }
        }

        await deleteFiles(imagesToDelete);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        const newValues = {
            ...product.toObject(),
            variants: updatedVariants
        };

        await AuditLogService.log({
            action: "UPDATE_PRODUCT",
            description: `Product "${oldValues.product_name}" successfully updated.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            old_values: {
                ...oldValues,
                variants: oldVariants
            },
            new_values: newValues
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: newValues
        });

    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();

        // Rollback uploaded images
        if (uploadedPublicIds.length > 0) {
            try {
                await deleteFiles(uploadedPublicIds);
            } catch (error) {
                console.error("Failed to rollback uploaded images:", error);
            }
        }

        next(err);
    }
};

export const searchProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, ...query } = req.query;

        // Build Mongoose filter
        const filter: any = {
            ...query,
            status: "active"
        };

        if (id !== undefined && id !== "") {
            filter._id = { $ne: id };
        }

        const product = await Product.findOne(filter);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (err) {
        next(err);
    }
}