import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OrderAttributes } from "../types/model-attributes";

const OrderSchema: Schema<OrderAttributes> = new Schema(
    {
        order_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        customer_name: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "cancelled"],
            default: "pending",
            required: true,
        },

        total_amount: {
            type: Number,
            required: true,
        },

        delivery_type: {
            type: String,
            enum: ["pickup", "delivery"],
            required: true,
        },

        payment_method: {
            type: String,
            enum: ["COD", "GCash", "Card"],
            required: true,
        },

        payment_status: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid",
            required: true,
        },
    },
    { timestamps: true } 
);

OrderSchema.virtual("order_items", {
    ref: "OrderItem",
    localField: "_id",
    foreignField: "order_id",
});

OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });

const Order: Model<OrderAttributes> = mongoose.model("Order", OrderSchema);

export default Order;