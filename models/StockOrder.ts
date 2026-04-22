
import mongoose, { Schema, Document, Model } from "mongoose";

export interface StockOrderAttributes extends Document {
    stock_order_id: string;
    distributor_id: mongoose.Types.ObjectId;
    items: {
        variant_id: mongoose.Types.ObjectId;
        quantity: number;
    };
    status: 'pending' | 'approved'| 'processing' | 'delivered' | 'received' | 'cancelled' | 'rejected' | 'failed';
}

const StockOrderSchema: Schema<StockOrderAttributes> = new Schema(
    {
        stock_order_id: {
            type: String,
            unique: true,
        },
        distributor_id: {
            type: Schema.Types.ObjectId,
            ref: "Distributor",
            required: true,
        },
        items: [{
            variant_id: {
                type: Schema.Types.ObjectId,
                ref: 'Variant',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        }],
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

StockOrderSchema.pre("save", async function (next) {
    if (!this.stock_order_id) {
        let unique = false;
        let generatedNo = "";

        while (!unique) {
            const random = Math.random().toString(36).substring(2, 7).toUpperCase();

            generatedNo = `SO-${random}`;

            const existing = await mongoose.models.StockOrder.findOne({ stock_order_id: generatedNo });

            if (!existing) unique = true;
        }

        this.stock_order_id = generatedNo;
    }
    next();
});


StockOrderSchema.virtual("items.variant", {
    ref: "Variant",
    localField: "items.variant_id",
    foreignField: "_id",
    justOne: true,
});

StockOrderSchema.virtual("distributor", {
    ref: 'Distributor',
    localField: 'distributor_id',
    foreignField: "_id",
    justOne: true,
})

StockOrderSchema.set("toObject", { virtuals: true });
StockOrderSchema.set("toJSON", { virtuals: true });

const StockOrder: Model<StockOrderAttributes> = mongoose.model(
    "StockOrder",
    StockOrderSchema
);

export default StockOrder;