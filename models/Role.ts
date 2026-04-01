import mongoose, { Schema, Document, Model } from "mongoose";
import { RoleAttributes } from "../types/model-attributes";

const RoleSchema: Schema<RoleAttributes> = new Schema(
    {
        name: {
            type: String,
            required: [true, "name is required."],
            unique: true,
            minlength: [3, "name must be at least 3 characters."],
            maxlength: [100, "name must be at most 100 characters."],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "description is required."],
            minlength: [10, "description must be at least 10 characters."],
            maxlength: [100, "description must be at most 100 characters."],
            trim: true,
        },
    },
    { timestamps: true }
);

RoleSchema.virtual("permissions", {
    ref: "Permission",
    localField: "_id",
    foreignField: "role_id",
});

RoleSchema.virtual("users", {
    ref: "User",
    localField: "_id",
    foreignField: "role_id",
});

RoleSchema.set("toObject", { virtuals: true });
RoleSchema.set("toJSON", { virtuals: true });

const Role: Model<RoleAttributes> = mongoose.model("Role", RoleSchema);

export default Role;