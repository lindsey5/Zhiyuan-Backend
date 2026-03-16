import { NextFunction, Request, Response } from "express";
import { deleteImage, uploadFile } from "../utils/cloudinary";
import { Product } from '../models/index';
import Variant from "../models/Variant";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const uploadedPublicIds: string[] = [];

    try {
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

        if (variants.length !== variantImages.length) throw new Error(`Number of variants (${variants.length}) does not match number of variant images (${variantImages.length})`);

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

        const productVariants = await Promise.all(variants.map(async (variant : any, i : number) => {
            const newVariant = await Variant.create({
                product_id: product.id,
                ...variant,
                image_url: variantImageUrls[i].secure_url,
                image_public_id: variantImageUrls[i].public_id
            });

            return newVariant.toJSON();
        }))

        res.status(200).json({
            success: true,
            message: "Product created successfully",
            product: { 
                ...product.toJSON(), 
                variants: productVariants 
            }
        });

    } catch (err: any) {
        if (uploadedPublicIds.length > 0) {
            for(const publicId of uploadedPublicIds){
                await deleteImage(publicId);
            }
        }
        next(err);
    }
};