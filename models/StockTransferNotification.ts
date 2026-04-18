import mongoose, { Schema, Model, Document } from "mongoose";

export interface StockTransferNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    stock_transfer_id: mongoose.Types.ObjectId;
}

const StockTransferNotificationSchema: Schema<StockTransferNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        stock_transfer_id: {
            type: Schema.Types.ObjectId,
            ref: "StockTransfer",
            required: true,
        },

    },
    { timestamps: true } 
);

StockTransferNotificationSchema.index({ user_id: 1 })

StockTransferNotificationSchema.virtual("stock_transfer", {
    ref: "StockTransfer",
    localField: "stock_transfer_id",
    foreignField: "_id",
    justOne: true,
})

StockTransferNotificationSchema.set("toObject", { virtuals: true });
StockTransferNotificationSchema.set("toJSON", { virtuals: true });

const StockTransferNotification: Model<StockTransferNotificationAttributes> = mongoose.model(
    "StockTransferNotification",
    StockTransferNotificationSchema
);

export default StockTransferNotification;