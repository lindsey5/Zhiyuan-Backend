import mongoose, { Schema, Model, Document } from "mongoose";

export interface SponsoredItemNotificationAttributes extends Document{
    notification_id: mongoose.Types.ObjectId;
    sponsored_id: mongoose.Types.ObjectId;
}

const SponsoredItemNotificationSchema: Schema<SponsoredItemNotificationAttributes> = new Schema(
    {
        notification_id: {
            type: Schema.Types.ObjectId,
            ref: "UserNotification",
            required: true
        },
        sponsored_id: {
            type: Schema.Types.ObjectId,
            ref: "SponsoredItem",
            required: true,
        },
    },
    { timestamps: true } 
);

SponsoredItemNotificationSchema.index({ notification_id: 1, sponsored_id: 1 })

SponsoredItemNotificationSchema.virtual("sponsored_item", {
    ref: "SponsoredItem",
    localField: "sponsored_id",
    foreignField: "_id",
    justOne: true,
});

SponsoredItemNotificationSchema.set("toObject", { virtuals: true });
SponsoredItemNotificationSchema.set("toJSON", { virtuals: true });

const SponsoredItemNotification: Model<SponsoredItemNotificationAttributes> = mongoose.model(
    "SponsoredItemNotification",
    SponsoredItemNotificationSchema
);

export default SponsoredItemNotification;