import mongoose, { Schema, Model, Document } from "mongoose";
import { StockOrderAttributes } from "./StockOrder";

export interface StockOrderNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    stockOrder: StockOrderAttributes;
}

const StockOrderNotificationSchema: Schema<StockOrderNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        order_id: {
            type: Schema.Types.ObjectId,
            ref: "StockOrder",
            required: true,
        },
    },
    { timestamps: true } 
);

StockOrderNotificationSchema.index({ notification_id: 1, order_id: 1 })

StockOrderNotificationSchema.virtual("stockOrder", {
    ref: "StockOrder",
    localField: "order_id",
    foreignField: "_id",
    justOne: true,
});

StockOrderNotificationSchema.set("toObject", { virtuals: true });
StockOrderNotificationSchema.set("toJSON", { virtuals: true });

const StockOrderNotification: Model<StockOrderNotificationAttributes> = mongoose.model(
    "StockOrderNotification",
    StockOrderNotificationSchema
);

export default StockOrderNotification;