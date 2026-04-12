
import mongoose, { Schema, Model, Document } from "mongoose";
import { ReturnRequestAttributes } from "./ReturnRequest";

export interface ReturnNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    return_id: mongoose.Types.ObjectId;
    returnRequest: ReturnRequestAttributes;
}

const ReturnNotificationSchema: Schema<ReturnNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        return_id: {
            type: Schema.Types.ObjectId,
            ref: "ReturnRequest",
            required: true,
        },
    },
    { timestamps: true } 
);

ReturnNotificationSchema.index({ notification_id: 1, return_id: 1 })

ReturnNotificationSchema.virtual("returnRequest", {
    ref: "ReturnRequest",
    localField: "return_id",
    foreignField: "_id",
    justOne: true,
});

ReturnNotificationSchema.set("toObject", { virtuals: true });
ReturnNotificationSchema.set("toJSON", { virtuals: true });

const ReturnNotification: Model<ReturnNotificationAttributes> = mongoose.model(
    "ReturnNotification",
    ReturnNotificationSchema
);

export default ReturnNotification;