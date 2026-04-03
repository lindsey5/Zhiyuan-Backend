import mongoose, { Schema, Document, Model } from "mongoose";

export interface DistributorSaleAttributes extends Document {
    seller_id: mongoose.Types.ObjectId; 
    variant_id: mongoose.Types.ObjectId;
    quantity: number;
    total_amount: number;
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
    },
    {
        timestamps: true, 
    }
);

const DistributorSale: Model<DistributorSaleAttributes> = mongoose.model(
    "DistributorSale",
    DistributorSaleSchema
);

export default DistributorSale;