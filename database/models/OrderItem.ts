import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface OrderItemAttributes extends Document {
    order_id: Types.ObjectId;
    variant_id: Types.ObjectId;
    quantity: number;
    amount: number;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderItemSchema: Schema<OrderItemAttributes> = new Schema(
    {
        order_id: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        variant_id: {
            type: Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true } 
);

const OrderItem: Model<OrderItemAttributes> = mongoose.model(
    "OrderItem",
    OrderItemSchema
);

export default OrderItem;