import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface WithdrawalRequestMethod extends Document{
    type: "cash" | "bank" | "gcash" | "maya";
    account_name?: string;
    account_number?: string;
    bank_name?: string;
}

export interface WithdrawalRequestAttributes extends Document {
    distributor_id: mongoose.Types.ObjectId;
    withdrawal_method: WithdrawalRequestMethod;
    amount: number;
    status: "pending" | "approved" | "completed" | "rejected" | "cancelled";
}

const WithdrawalRequestSchema: Schema<WithdrawalRequestAttributes> = new Schema(
    {
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Distributor'
        },

        withdrawal_method: {
            type: {
                type: String,
                enum: ["cash", "bank", "gcash", "maya"],
                required: true,
            },

            account_name: {
                type: String,
                trim: true,
            },

            account_number: {
                type: String,
                trim: true,
            },

            bank_name: {
                type: String,
                required: function (this: any) {
                    return this.type === "bank";
                },
                trim: true,
            },
        },

        amount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "completed", "rejected", "cancelled"],
            default: "pending",
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

WithdrawalRequestSchema.virtual("distributor", {
    ref: "Distributor",
    localField: "distributor_id",
    foreignField: "_id",
    justOne: true
});

WithdrawalRequestSchema.set("toObject", { virtuals: true });
WithdrawalRequestSchema.set("toJSON", { virtuals: true });

const WithdrawalRequest: Model<WithdrawalRequestAttributes> = mongoose.model(
    "WithdrawalRequest",
    WithdrawalRequestSchema
);

export default WithdrawalRequest;