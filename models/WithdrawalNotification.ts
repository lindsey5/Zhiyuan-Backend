
import mongoose, { Schema, Model, Document } from "mongoose";
import { WithdrawalRequestAttributes } from "./WithdrawalRequest";

export interface WithdrawalNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    withdrawal_id: mongoose.Types.ObjectId;
    withdrawalRequest: WithdrawalRequestAttributes;
}

const WithdrawalNotificationSchema: Schema<WithdrawalNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        withdrawal_id: {
            type: Schema.Types.ObjectId,
            ref: "WithdrawalRequest",
            required: true,
        },
    },
    { timestamps: true } 
);

WithdrawalNotificationSchema.index({ notification_id: 1, withdrawal_id: 1 })

WithdrawalNotificationSchema.virtual("withdrawalRequest", {
    ref: "WithdrawalRequest",
    localField: "withdrawal_id",
    foreignField: "_id",
    justOne: true,
});

WithdrawalNotificationSchema.set("toObject", { virtuals: true });
WithdrawalNotificationSchema.set("toJSON", { virtuals: true });

const WithdrawalNotification: Model<WithdrawalNotificationAttributes> = mongoose.model(
    "WithdrawalNotification",
    WithdrawalNotificationSchema
);

export default WithdrawalNotification;