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

StockTransferItemSchema.virtual("variant", {
    ref: "Variant",
    localField: "variant_id",
    foreignField: "_id",
    justOne: true
});

StockTransferItemSchema.set("toObject", { virtuals: true });
StockTransferItemSchema.set("toJSON", { virtuals: true });

const StockTransferItem: Model<StockTransferItemAttributes> = mongoose.model(
    "StockTransferItem",
    StockTransferItemSchema
);

export default StockTransferItem;