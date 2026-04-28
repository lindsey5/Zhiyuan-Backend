import mongoose, { Schema, Document, Model } from "mongoose";

export interface SponsoredItemAttributes extends Document {
    sponsored_id: string;
    distributor_id: mongoose.Types.ObjectId;
    variant_id: mongoose.Types.ObjectId;
    quantity: number;
    status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected' | 'expired',
}

const SponsoredItemSchema: Schema<SponsoredItemAttributes> = new Schema(
    {
        sponsored_id: {
            type: String,
            unique: true
        },
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Distributor',
            required: true
        },
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
            enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected', 'expired'],
            default: 'pending',
            required: true
        }
    },
    {
        timestamps: true,
    }
);

SponsoredItemSchema.pre("save", async function (next) {
    if (!this.sponsored_id) {
        let unique = false;
        let generatedNo = "";

        while (!unique) {
            const random = Math.random().toString(36).substring(2, 7).toUpperCase();

            generatedNo = `SI-${random}`;

            const existing = await mongoose.models.SponsoredItem.findOne({ sponsored_id: generatedNo });

            if (!existing) unique = true;
        }

        this.sponsored_id = generatedNo;
    }
    next();
});

SponsoredItemSchema.index({ createdAt: -1 });
SponsoredItemSchema.index({ status: 1, createdAt: -1 });
SponsoredItemSchema.index({ distributor_id: 1, createdAt: -1 });
SponsoredItemSchema.index({ variant_id: 1 });
SponsoredItemSchema.index({ sponsored_id: 1 });
SponsoredItemSchema.index({ status: 1, distributor_id: 1 });

SponsoredItemSchema.virtual("variant", {
    ref: "Variant",          
    localField: "variant_id", 
    foreignField: "_id",   
    justOne: true    
});

SponsoredItemSchema.virtual("distributor", {
    ref: "Distributor",          
    localField: "distributor_id", 
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