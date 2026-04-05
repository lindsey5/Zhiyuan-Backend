import mongoose, { Schema, Document, Model } from "mongoose";

export interface StockTransferAttributes extends Document {
    sender_id?: mongoose.Types.ObjectId | null;
    receiver_id: mongoose.Types.ObjectId;
}

const StockTransferSchema: Schema<StockTransferAttributes> = new Schema(
    {
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
    }
);

StockTransferSchema.virtual("receiver", {
    ref: "Distributor",
    localField: "receiver_id",
    foreignField: "_id",
    justOne: true
});

StockTransferSchema.index({ createdAt: -1 });
StockTransferSchema.index({ createdAt: -1, "sender": 1 });
StockTransferSchema.index({ createdAt: -1, "receiver": 1 });

StockTransferSchema.virtual("sender", {
    ref: "User",
    localField: "sender_id",
    foreignField: "_id",
    justOne: true
});

StockTransferSchema.virtual("items", {
    ref: "StockTransferItem",
    localField: "_id",
    foreignField: "transfer_id",
});

StockTransferSchema.set("toObject", { virtuals: true });
StockTransferSchema.set("toJSON", { virtuals: true });


const StockTransfer: Model<StockTransferAttributes> = mongoose.model(
    "StockTransfer",
    StockTransferSchema
);

export default StockTransfer;