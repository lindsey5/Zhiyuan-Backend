import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { VariantAttributes } from "../types/model-attributes";

const VariantSchema: Schema<VariantAttributes> = new Schema(
    {
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required."],
        },

        variant_name: {
            type: String,
            required: [true, "Variant name is required."],
            minlength: [2, "Variant name must be at least 2 characters."],
            maxlength: [100, "Variant name must be at most 100 characters."],
            trim: true,
        },

        image_url: {
            type: String,
            required: [true, "Variant image URL is required."],
            trim: true,
        },

        image_public_id: {
            type: String,
            required: [true, "Variant image public id is required."],
            trim: true,
        },

        stock: {
            type: Number,
            required: [true, "Stock is required."],
            min: [0, "Stock cannot be negative."],
        },

        price: {
            type: Number,
            required: [true, "Price is required."],
            min: [0, "Price cannot be negative."],
        },

        sku: {
            type: String,
            required: [true, "SKU is required."],
            minlength: [3, "SKU must be at least 3 characters."],
            maxlength: [100, "SKU must be at most 100 characters."],
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

VariantSchema.index({ product_id: 1, status: 1 });
VariantSchema.index({ status: 1, variant_name: 1, sku: 1})
VariantSchema.index({ variant_name: 'text', sku: 'text' })

VariantSchema.virtual("product", {
    ref: "Product",          
    localField: "product_id", 
    foreignField: "_id",      
    match: { status: 'active' },
    justOne: true,           
});

VariantSchema.set("toObject", { virtuals: true });
VariantSchema.set("toJSON", { virtuals: true });

const Variant: Model<VariantAttributes> = mongoose.model(
    "Variant",
    VariantSchema
);

export default Variant;