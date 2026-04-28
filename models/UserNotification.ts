import mongoose, { Schema, Model, Document } from "mongoose";
import { SaleNotificationAttributes } from "./SaleNotification";
import { ReturnNotificationAttributes } from "./ReturnNotification";
import { OrderNotificationAttributes } from "./OrderNotification";

export interface UserNotificationAttributes extends Document {
  user_id: mongoose.Types.ObjectId;
  message: string;
  status: "read" | "unread";
  saleNotification?: SaleNotificationAttributes;
  returnNotification?: ReturnNotificationAttributes;
  orderNotification?: OrderNotificationAttributes;
}

const UserNotificationSchema: Schema<UserNotificationAttributes> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["read", "unread"],
            default: "unread",
            required: true,
        },
    },
    { timestamps: true }
);

UserNotificationSchema.index({ user_id: 1, createdAt: -1 });
UserNotificationSchema.index({ user_id: 1, status: 1 });
UserNotificationSchema.index({ createdAt: -1 });
UserNotificationSchema.index({ status: 1 });


UserNotificationSchema.virtual("saleNotification", {
    ref: "SaleNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.virtual("returnNotification", {
    ref: "ReturnNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.virtual("orderNotification", {
    ref: "OrderNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.virtual("stockTransferNotification", {
    ref: "StockTransferNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.virtual("stockOrderNotification", {
    ref: "StockOrderNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.virtual("sponsoredItemNotification", {
    ref: "SponsoredItemNotification",
    localField: "_id",
    foreignField: "notification_id",
    justOne: true,
});

UserNotificationSchema.set("toJSON", { virtuals: true });
UserNotificationSchema.set("toObject", { virtuals: true });

const UserNotification: Model<UserNotificationAttributes> =  mongoose.model("UserNotification", UserNotificationSchema);

export default UserNotification;