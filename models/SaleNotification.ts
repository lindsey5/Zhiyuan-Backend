import mongoose, { Schema, Model, Document } from "mongoose";

export interface SaleNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    distributor_id: mongoose.Types.ObjectId;
    sale_ids: mongoose.Types.ObjectId[]; 
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

        sale_ids: [{
            type: Schema.Types.ObjectId,
            ref: "DistributorSale",
            required: true
        }]
    },
    { timestamps: true } 
);

SaleNotificationSchema.index({ user_id: 1 })

SaleNotificationSchema.virtual("sold_by", {
    ref: "Distributor",
    localField: "distributor_id",
    foreignField: "_id",
    justOne: true,
})

SaleNotificationSchema.virtual("sales", {
    ref: "DistributorSale",
    localField: "sale_ids",
    foreignField: "_id",
});

SaleNotificationSchema.set("toObject", { virtuals: true });
SaleNotificationSchema.set("toJSON", { virtuals: true });


const SaleNotification: Model<SaleNotificationAttributes> = mongoose.model(
    "SaleNotification",
    SaleNotificationSchema
);

export default SaleNotification;