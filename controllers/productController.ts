import { NextFunction, Request, Response } from "express";
import { deleteFile, deleteFiles, uploadBase64, uploadFile } from "../utils/cloudinary";
import { Product } from '../models/index';
import Variant from "../models/Variant";
import { Op } from "sequelize";
import { VariantAttributes } from "../types/model-attributes";
import sequelize from "../config/db";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const uploadedPublicIds: string[] = [];

    try {
        const variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;

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

        const { public_id: thumbnailPublicId, secure_url : thumbnailUrl } = await uploadFile(thumbnail.buffer);
        uploadedPublicIds.push(thumbnailPublicId);

        const variantImageUrls = await Promise.all(variantImages.map(async (variantImage) => {
            const uploadedImage = await uploadFile(variantImage.buffer);
            uploadedPublicIds.push(uploadedImage.public_id);
            
            return { 
                public_id: uploadedImage.public_id,
                secure_url: uploadedImage.secure_url
            }
        }));

        const product = await Product.create({
            product_name: req.body.product_name,
            description: req.body.description,
            thumbnail_public_id: thumbnailPublicId,
            thumbnail_url: thumbnailUrl,
        });

        const productVariants = await Variant.bulkCreate(
            variants.map((
                variant : any, 
                i : number
            ) => ({
                product_id: product.id,
                ...variant,
                image_url: variantImageUrls[i].secure_url,
                image_public_id: variantImageUrls[i].public_id
            }))
        )

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: { 
                ...product.toJSON(), 
                variants: productVariants.map(variant => variant.toJSON()) 
            }
        });

    } catch (err: any) {
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

export const getProducts = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search ? String(req.query.search) : "";

        const { count, rows } = await Product.findAndCountAll({
            where: search
                ? { product_name: { [Op.like]: `%${search}%` } }
                : undefined,
            include: [
                {
                    model: Variant,
                    as: 'variants'
                }
            ],
            limit,
            offset: (page - 1) * limit,
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            products: rows,
        })

    } catch(err : any){
        next(err);
    }
}

export const getProductById = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const product = await Product.findByPk(req.params.id as string, {
            include: [
                {
                    model: Variant,
                    as: 'variants'
                }
            ]
        });

        if(!product){
            res.status(404).json({
                success: false,
                message: 'Product not found.'
            })
            return
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch(err : any){
        next(err);
    }
}

export const deleteProduct = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const product = await Product.findByPk(req.params.id as string, {
            include: [
                { model: Variant, as: "variants" }
            ]
        });

        if(!product){
            res.status(404).json({
                success: false,
                message: 'Product not found.'
            })
            return
        }

        await deleteFile(product.thumbnail_public_id);

        for(const variant of (product as any).variants){
            await deleteFile(variant.image_public_id);
        }

        await product.destroy();

        res.status(200).json({
            success: true,
            message: 'Product successfully deleted.'
        })

    }catch(err : any){
        next(err);
    }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const uploadedPublicIds: string[] = [];
    const t = await sequelize.transaction();

    try {      
        // FETCH PRODUCT
        const product = await Product.findByPk(req.params.id as string, {
            include: [{ model: Variant, as: "variants" }],
            transaction: t
        });

        if (!product) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const oldVariants = (product as any).variants || [];
        const { variants, ...updatedProduct } = req.body;

        if (!variants || !Array.isArray(variants)) {
            throw new Error("Variants must be an array");
        }

        const imagesToDelete: string[] = [];

        // UPDATE THUMBNAIL
        if (updatedProduct.thumbnail_url && updatedProduct.thumbnail_url !== product.thumbnail_url) {
            // Upload new thumbnail if it's a base64 string
            if (updatedProduct.thumbnail_url.startsWith("data:image")) {
                const { public_id, secure_url } = await uploadBase64(updatedProduct.thumbnail_url);
                uploadedPublicIds.push(public_id);
                imagesToDelete.push(product.thumbnail_public_id);

                updatedProduct.thumbnail_public_id = public_id;
                updatedProduct.thumbnail_url = secure_url;
            }
        }

        await product.update(updatedProduct, { transaction: t });

        // UPDATE / CREATE VARIANTS
        const updatedVariants = await Promise.all(
            variants.map(async (variant: VariantAttributes) => {
                let existingVariant = variant.id 
                    ? await Variant.findByPk(variant.id, { transaction: t })
                    : null;

                if (existingVariant) {
                    // Only upload new image if it's base64
                    if (variant.image_url?.startsWith("data:image") && variant.image_url !== existingVariant.image_url) {
                        const { public_id, secure_url } = await uploadBase64(variant.image_url);
                        uploadedPublicIds.push(public_id);
                        imagesToDelete.push(existingVariant.image_public_id);

                        variant.image_public_id = public_id;
                        variant.image_url = secure_url;
                    }

                    await existingVariant.update(variant, { transaction: t });
                    return existingVariant.toJSON();
                }

                // CREATE NEW VARIANT
                let newImageUrl = variant.image_url;
                let newImagePublicId = "";

                if (variant.image_url.startsWith("data:image")) {
                    const { public_id, secure_url } = await uploadBase64(variant.image_url);
                    uploadedPublicIds.push(public_id);
                    newImagePublicId = public_id;
                    newImageUrl = secure_url;
                }

                const newVariant = await Variant.create({
                    product_id: product.id,
                    variant_name: variant.variant_name,
                    price: variant.price,
                    stock: variant.stock,
                    sku: variant.sku,
                    image_public_id: newImagePublicId,
                    image_url: newImageUrl
                }, { transaction: t });

                return newVariant.toJSON();
            })
        );

        // DELETE REMOVED VARIANTS
        const incomingIds = variants.filter((v: VariantAttributes) => v.id).map((v: VariantAttributes) => v.id);

        for (const oldVariant of oldVariants) {
            if (!incomingIds.includes(oldVariant.id)) {
                imagesToDelete.push(oldVariant.image_public_id);
                await oldVariant.destroy({ transaction: t });
            }
        }

        // COMMIT TRANSACTION
        await t.commit();

        // DELETE OLD IMAGES FROM CLOUDINARY
        try {
            await deleteFiles(imagesToDelete);
        } catch (err) {
            console.error("Failed to delete old images:", err);
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: {
                ...product.toJSON(),
                variants: updatedVariants
            }
        });

    } catch (err: any) {
        // ROLLBACK DB
        await t.rollback();

        // DELETE any uploaded images (rollback Cloudinary)
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