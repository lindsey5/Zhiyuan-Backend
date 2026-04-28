import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OrderAttributes } from "../types/model-attributes";

const OrderSchema: Schema<OrderAttributes> = new Schema(
    {
        order_id: {
            type: String,
            unique: true,
            trim: true,
        },

        customer_name: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "delivered", "completed", "cancelled", "refunded", "expired", "failed"],
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

        address: {
            type: {
                street: {
                    type: String,
                    required: true,
                },
                barangay: {
                    type: String,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
            },
            required: false,
        },

        payment_method: {
            type: String,
            enum: ["cash", "gcash", "card", "paymaya"],
        },
         
        payment: {
            type: Number,
            required: false,
        },
        
        change: {
            type: Number,
            required: false
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

OrderSchema.index({ customer_name: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ payment_status: 1, createdAt: -1 });
OrderSchema.index({ payment_method: 1, createdAt: -1 });
OrderSchema.index({ delivery_type: 1, createdAt: -1 });

OrderSchema.pre("save", async function (next) {
    if (!this.order_id) {
        let unique = false;
        let generatedId = "";

        while (!unique) {
            const random = Math.random().toString(36).substring(2, 7).toUpperCase();

            generatedId = `ORD-${random}`;

            const existing = await mongoose.models.Order.findOne({ order_id: generatedId });

            if (!existing) unique = true;
        }

        this.order_id = generatedId;
    }

    next();
});

OrderSchema.virtual("order_items", {
    ref: "OrderItem",
    localField: "_id",
    foreignField: "order_id",
});

OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });

const Order: Model<OrderAttributes> = mongoose.model("Order", OrderSchema);

export default Order;