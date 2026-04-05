import mongoose, { Schema, Document, Model } from "mongoose";
import { ProductAttributes } from "../types/model-attributes";

const ProductSchema: Schema<ProductAttributes> = new Schema(
    {
        product_name: {
            type: String,
            required: [true, "product name is required."],
            minlength: [3, "product name must be at least 3 characters."],
            maxlength: [100, "product name must be at most 100 characters."],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "description is required."],
            minlength: [5, "description must be at least 5 characters."],
            maxlength: [1000, "description must be at most 1000 characters."],
            trim: true,
        },

        thumbnail_public_id: {
            type: String,
            required: [true, "Thumbnail Public Id is required."],
            trim: true,
        },

        thumbnail_url: {
            type: String,
            required: [true, "Thumbnail URL is required."],
            trim: true,
        },

        category: {
            type: String,
            required: [true, "Category is required."],
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active",
            required: true,
        },
    },
    { timestamps: true } 
);

ProductSchema.index({ status: 1, category: 1 });
ProductSchema.index({ status: 1, product_name: 1 });
ProductSchema.index({ product_name: "text" });

ProductSchema.virtual("variants", {
    ref: "Variant",
    localField: "_id",
    foreignField: "product_id",
    match: { status: "active" },
});

ProductSchema.set("toObject", { virtuals: true });
ProductSchema.set("toJSON", { virtuals: true });

const Product: Model<ProductAttributes> = mongoose.model(
    "Product",
    ProductSchema
);

export default Product;