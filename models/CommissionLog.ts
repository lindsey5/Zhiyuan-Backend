import mongoose, { Schema, Document, Model } from "mongoose";

export interface CommissionLogAttributes extends Document {
    sale_ids: mongoose.Types.ObjectId[];
    receiver_id: mongoose.Types.ObjectId;
    commission_rate: number;
    commission_amount: number;
}

const CommissionLogSchema: Schema<CommissionLogAttributes> = new Schema(
    {
        sale_ids: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: "DistributorSale",
            }],
            required: true,
        },

        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        commission_rate: {
            type: Number,
            required: true,
        },

        commission_amount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

CommissionLogSchema.index({ sale_id: 1, receiver_id: 1, commission_amount: 1, createdAt: -1 })

CommissionLogSchema.virtual("sales", {
    ref: "DistributorSale",          
    localField: "sale_ids", 
    foreignField: "_id",   
});

CommissionLogSchema.virtual("receiver", {
    ref: "Distributor",
    localField: "receiver_id",
    foreignField: "_id",
    justOne: true
})

CommissionLogSchema.set("toObject", { virtuals: true });
CommissionLogSchema.set("toJSON", { virtuals: true });

const CommissionLog: Model<CommissionLogAttributes> = mongoose.model(
    "CommissionLog",
    CommissionLogSchema
);

export default CommissionLog;