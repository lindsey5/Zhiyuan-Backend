import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { AuditLogAttributes } from "../../types/model-attributes";

const AuditLogSchema: Schema<AuditLogAttributes> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            required: [true, "role is required."],
            trim: true,
        },

        action: {
            type: String,
            required: [true, "action is required."],
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            required: true,
        },

        ip_address: {
            type: String,
            required: true,
        },

        user_agent: {
            type: String,
            required: true,
        },

        old_values: {
            type: Schema.Types.Mixed, 
            default: null,
        },

        new_values: {
            type: Schema.Types.Mixed, 
            default: null,
        },
    },
    { timestamps: true } 
);

AuditLogSchema.virtual("user", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,  
});

AuditLogSchema.set("toObject", { virtuals: true });
AuditLogSchema.set("toJSON", { virtuals: true });

const AuditLog: Model<AuditLogAttributes> = mongoose.model(
    "AuditLog",
    AuditLogSchema
);

export default AuditLog;