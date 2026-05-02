import mongoose, { Schema, Document, Model } from "mongoose";
import { DistributorAttributes, VariantAttributes } from "../types/model-attributes";

export interface DistributorSaleAttributes extends Document {
    seller_id: mongoose.Types.ObjectId; 
    variant_id: mongoose.Types.ObjectId;
    quantity: number;
    total_amount: number;
    variant?: VariantAttributes;
    seller?: DistributorAttributes;
    commission: number;
    commission_rate: number;
    parent_commission: number;
    parent_commission_rate: number;
}

const DistributorSaleSchema: Schema<DistributorSaleAttributes> = new Schema(
    {
        seller_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        variant_id: {
            type: Schema.Types.ObjectId,
            ref: 'Variant'
        },

        quantity: {
            type: Number,
            required: true,
        },

        total_amount: {
            type: Number,
            required: true,
        },

        commission: {
            type: Number,
            required: true,
        },

        parent_commission: {
            type: Number,
            required: true,
        },

        commission_rate: {
            type: Number,
            required: true,
        },

        parent_commission_rate: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

DistributorSaleSchema.index({ seller_id: 1 });
DistributorSaleSchema.index({ variant_id: 1 });
DistributorSaleSchema.index({ createdAt: -1 });
DistributorSaleSchema.index({ seller_id: 1, createdAt: -1 });

DistributorSaleSchema.virtual("seller", {
    ref: "Distributor",          
    localField: "seller_id", 
    foreignField: "_id",   
    justOne: true    
});

DistributorSaleSchema.virtual("variant", {
    ref: "Variant",
    localField: "variant_id",
    foreignField: "_id",
    justOne: true
});

DistributorSaleSchema.set("toObject", { virtuals: true });
DistributorSaleSchema.set("toJSON", { virtuals: true });

const DistributorSale: Model<DistributorSaleAttributes> = mongoose.model(
    "DistributorSale",
    DistributorSaleSchema
);

export default DistributorSale;