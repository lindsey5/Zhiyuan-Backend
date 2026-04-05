import mongoose, { Schema, Document, Model } from "mongoose";

export interface DistributorNotificationAttributes extends Document {
    distributor_id: mongoose.Types.ObjectId;
    transfer_id: mongoose.Types.ObjectId;
    message: string;
    status: 'read' | 'unread'
}

const DistributorNotificationSchema: Schema<DistributorNotificationAttributes> = new Schema(
    {
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        transfer_id: {
            type: Schema.Types.ObjectId,
            ref: "StockTransfer",
            required: true,
        },

        message: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ['read', 'unread'],
            default: 'unread',
            required: true
        }
    },
    {
        timestamps: true, 
    }
);

DistributorNotificationSchema.virtual("stockTransfer", {
    ref: "StockTransfer",          
    localField: "transfer_id", 
    foreignField: "_id",   
    justOne: true    
});

DistributorNotificationSchema.set("toObject", { virtuals: true });
DistributorNotificationSchema.set("toJSON", { virtuals: true });

const DistributorNotification: Model<DistributorNotificationAttributes> = mongoose.model(
    "DistributorNotification",
    DistributorNotificationSchema
);

export default DistributorNotification;