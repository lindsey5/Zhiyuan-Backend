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

OrderItemSchema.index({ order_id: 1 });
OrderItemSchema.index({ variant_id: 1 });
OrderItemSchema.index({ order_id: 1, variant_id: 1 });
OrderItemSchema.index({ createdAt: -1 });

OrderItemSchema.virtual("variant", {
    ref: "Variant",
    localField: "variant_id",
    foreignField: "_id",
    justOne: true
});

OrderItemSchema.set("toObject", { virtuals: true });
OrderItemSchema.set("toJSON", { virtuals: true });

const OrderItem: Model<OrderItemAttributes> = mongoose.model(
    "OrderItem",
    OrderItemSchema
);

export default OrderItem;