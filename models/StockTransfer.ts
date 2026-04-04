import mongoose, { Schema, Document, Model } from "mongoose";

export interface StockTransferAttributes extends Document {
    sender_id?: mongoose.Types.ObjectId | null;
    receiver_id: mongoose.Types.ObjectId;
}

const StockTransferSchema: Schema<StockTransferAttributes> = new Schema(
    {

        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },

        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const StockTransfer: Model<StockTransferAttributes> = mongoose.model(
    "StockTransfer",
    StockTransferSchema
);

export default StockTransfer;