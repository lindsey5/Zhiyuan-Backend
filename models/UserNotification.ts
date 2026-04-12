
import mongoose, { Schema, Model, Document } from "mongoose";

export interface UserNotificationAttributes extends Document{
    user_id: mongoose.Types.ObjectId;
    message: string;
    status: 'read' | 'unread'
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
            default: 'unread',
            required: true
        }
    },
    { timestamps: true } 
);

UserNotificationSchema.index({ user_id: 1 })

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

UserNotificationSchema.set("toJSON", { virtuals: true });
UserNotificationSchema.set("toObject", { virtuals: true });

const UserNotification: Model<UserNotificationAttributes> = mongoose.model(
    "UserNotification",
    UserNotificationSchema
);

export default UserNotification;