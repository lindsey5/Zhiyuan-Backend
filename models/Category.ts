import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { CategoryAttributes } from "../types/model-attributes";

const CategorySchema: Schema<CategoryAttributes> = new Schema(
    {
        name: {
            type: String,
            required: [true, "name is required."],
            minlength: [3, "name must be at least 3 characters."],
            maxlength: [100, "name must be at most 100 characters."],
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active",
            required: true,
        },
    },
    { timestamps: true } 
);

CategorySchema.index({ name: 1, status: 1 })

const Category: Model<CategoryAttributes> = mongoose.model(
    "Category",
    CategorySchema
);

export default Category;