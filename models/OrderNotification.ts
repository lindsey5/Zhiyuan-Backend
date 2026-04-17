import mongoose, { Schema, Model, Document } from "mongoose";

export interface OrderNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
}

const OrderNotificationSchema: Schema<OrderNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        order_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

    },
    { timestamps: true } 
);

OrderNotificationSchema.virtual("order", {
    ref: "Order",
    localField: "order_id",
    foreignField: "_id",
    justOne: true,
})

OrderNotificationSchema.set("toObject", { virtuals: true });
OrderNotificationSchema.set("toJSON", { virtuals: true });


const OrderNotification: Model<OrderNotificationAttributes> = mongoose.model(
    "OrderNotification",
    OrderNotificationSchema
);

export default OrderNotification;