import mongoose, { Schema, Document, Model } from "mongoose";

export interface StockTransferItemAttributes extends Document {
    transfer_id: mongoose.Types.ObjectId;
    quantity: number;
    variant_id: mongoose.Types.ObjectId;
}

const StockTransferItemSchema: Schema<StockTransferItemAttributes> = new Schema(
    {
        transfer_id: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },

        variant_id: {
            type: Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const StockTransferItem: Model<StockTransferItemAttributes> = mongoose.model(
    "StockTransferItem",
    StockTransferItemSchema
);

export default StockTransferItem;