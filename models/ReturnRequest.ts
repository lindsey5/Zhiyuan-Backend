import mongoose, { Schema, Document, Model } from "mongoose";

export interface ReturnRequestAttributes extends Document {
    distributor_id: mongoose.Types.ObjectId;
    items: {
        variant_id: mongoose.Types.ObjectId;
        quantity: number;
        status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'insufficient stock'
    }[];
    reason: string;
}

const ReturnRequestSchema: Schema<ReturnRequestAttributes> = new Schema(
    {
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        items: [{
            variant_id: {
                type: Schema.Types.ObjectId,
                ref: "Variant",
                required: true,
            },
            quantity: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'expired', 'insufficient stock'],
                default: 'pending'
            }
        }],

        reason: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

ReturnRequestSchema.virtual("items.variant", {
    ref: "Variant",
    localField: "items.variant_id",
    foreignField: "_id",
    justOne: true,
});

ReturnRequestSchema.virtual("distributor", {
    ref: 'Distributor',
    localField: 'distributor_id',
    foreignField: "_id",
    justOne: true,
})

ReturnRequestSchema.set("toObject", { virtuals: true });
ReturnRequestSchema.set("toJSON", { virtuals: true });

const ReturnRequest: Model<ReturnRequestAttributes> = mongoose.model(
    "ReturnRequest",
    ReturnRequestSchema
);

export default ReturnRequest;