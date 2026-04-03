import mongoose, { Schema, Document, Model } from "mongoose";

export interface CommissionLogAttributes extends Document {
  sale_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
  commission_rate: number;
  commission_amount: number;
}

const CommissionLogSchema: Schema<CommissionLogAttributes> = new Schema(
    {
        sale_id: {
            type: Schema.Types.ObjectId,
            ref: "DistributorSale",
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

const CommissionLog: Model<CommissionLogAttributes> = mongoose.model(
    "CommissionLog",
    CommissionLogSchema
);

export default CommissionLog;