import mongoose, { Schema, Document, Model } from "mongoose";
import { DistributorAttributes, UserAttributes } from "../types/model-attributes";
import { StockTransferItemAttributes } from "./StockTransferItem";

export interface StockTransferAttributes extends Document {
    transfer_no: string;
    sender_id?: mongoose.Types.ObjectId | null;
    receiver_id: mongoose.Types.ObjectId;
    status: 'pending' | 'approved'| 'processing' | 'delivered' | 'received' | 'cancelled' | 'rejected' | 'failed';
    receiver: DistributorAttributes;
    items: StockTransferItemAttributes[];
    sender: UserAttributes;
}

const StockTransferSchema: Schema<StockTransferAttributes> = new Schema(
    {
        transfer_no: {
            type: String,
            unique: true,
        },
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'processing', 'delivered', 'received', 'cancelled', 'rejected', 'failed'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    }
);

StockTransferSchema.virtual("receiver", {
    ref: "Distributor",
    localField: "receiver_id",
    foreignField: "_id",
    justOne: true
});

StockTransferSchema.index({ createdAt: -1, sender_id: 1, receiver_id: 1 });

StockTransferSchema.virtual("sender", {
    ref: "User",
    localField: "sender_id",
    foreignField: "_id",
    justOne: true
});

StockTransferSchema.virtual("receiver", {
    ref: "Distributor",
    localField: "receiver_id",
    foreignField: "_id",
    justOne: true
});

StockTransferSchema.virtual("items", {
    ref: "StockTransferItem",
    localField: "_id",
    foreignField: "transfer_id",
});

StockTransferSchema.set("toObject", { virtuals: true });
StockTransferSchema.set("toJSON", { virtuals: true });

StockTransferSchema.pre("save", async function (next) {
    if (!this.transfer_no) {
        let unique = false;
        let generatedNo = "";

        while (!unique) {
            const random = Math.random().toString(36).substring(2, 7).toUpperCase();

            generatedNo = `ST-${random}`;

            const existing = await mongoose.models.StockTransfer.findOne({ transfer_no: generatedNo });

            if (!existing) unique = true;
        }

        this.transfer_no = generatedNo;
    }

    next();
});

const StockTransfer: Model<StockTransferAttributes> = mongoose.model(
    "StockTransfer",
    StockTransferSchema
);

export default StockTransfer;