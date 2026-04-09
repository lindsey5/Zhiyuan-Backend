
import mongoose, { Schema, Model, Document } from "mongoose";

export interface UserNotificationAttributes extends Document{
    user_id: mongoose.Types.ObjectId;
    message: string;
}

const UserNotificationSchema: Schema<UserNotificationAttributes> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "DistributorSale",
            required: true,
        },

        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } 
);

UserNotificationSchema.index({ user_id: 1 })

const UserNotification: Model<UserNotificationAttributes> = mongoose.model(
    "UserNotification",
    UserNotificationSchema
);

export default UserNotification;