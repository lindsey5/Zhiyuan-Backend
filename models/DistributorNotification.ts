import mongoose, { Schema, Document, Model } from "mongoose";
import { StockTransferAttributes } from "./StockTransfer";

export interface DistributorNotificationAttributes extends Document {
    distributor_id: mongoose.Types.ObjectId;
    transfer_id?: mongoose.Types.ObjectId;
    return_id?: mongoose.Types.ObjectId;
    stock_order_id?: mongoose.Types.ObjectId;
    sale_ids?: mongoose.Types.ObjectId[];
    message: string;
    stockTransfer: StockTransferAttributes;
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
        },

        return_id: {
            type: Schema.Types.ObjectId,
            ref: 'ReturnRequest',
        },

        sale_ids: [{
            type: Schema.Types.ObjectId,
            ref: 'DistributorSale'
        }],

        stock_order_id: {
            type: Schema.Types.ObjectId,
            ref: 'StockOrder'
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

DistributorNotificationSchema.virtual("sales", {
    ref: "DistributorSale",          
    localField: "sale_ids", 
    foreignField: "_id",   
});

DistributorNotificationSchema.virtual("returnRequest", {
    ref: "ReturnRequest",          
    localField: "return_id", 
    foreignField: "_id",   
    justOne: true    
});

DistributorNotificationSchema.virtual("stockOrder", {
    ref: "StockOrder",          
    localField: "stock_order_id", 
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