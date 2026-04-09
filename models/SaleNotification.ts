
import mongoose, { Schema, Model, Document } from "mongoose";

export interface SaleNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    distributor_id: mongoose.Types.ObjectId;
    sales: mongoose.Types.ObjectId[]; 
}

const SaleNotificationSchema: Schema<SaleNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        sales: [{
            type: Schema.Types.ObjectId,
            ref: "DistributorSale",
            required: true
        }]
    },
    { timestamps: true } 
);

SaleNotificationSchema.index({ user_id: 1 })

const SaleNotification: Model<SaleNotificationAttributes> = mongoose.model(
    "SaleNotification",
    SaleNotificationSchema
);

export default SaleNotification;