import mongoose, { Schema, Document, Model } from "mongoose";

export interface SponsoredItemAttributes extends Document {
    variant_id: mongoose.Types.ObjectId;
    quantity: number;
    status: 'pending' | 'accepted' | 'rejected';
}

const SponsoredItemSchema: Schema<SponsoredItemAttributes> = new Schema(
    {
        variant_id: {
            type: Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    }
);

SponsoredItemSchema.virtual("variant", {
    ref: "Variant",          
    localField: "variant_id", 
    foreignField: "_id",   
    justOne: true    
});

SponsoredItemSchema.set("toObject", { virtuals: true });
SponsoredItemSchema.set("toJSON", { virtuals: true });

const SponsoredItem: Model<SponsoredItemAttributes> = mongoose.model(
    "SponsoredItem",
    SponsoredItemSchema
);

export default SponsoredItem;