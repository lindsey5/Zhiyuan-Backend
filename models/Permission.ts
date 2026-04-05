import mongoose, { Schema, Document, Model, Types } from "mongoose";
import PERMISSIONS from "../utils/permissions";
import { PermissionAttributes } from "../types/model-attributes";

const PermissionSchema: Schema<PermissionAttributes> = new Schema(
    {
        action: {
            type: String,
            enum: Object.values(PERMISSIONS), 
            required: [true, "action is required."],
            trim: true,
        },

        role_id: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: [true, "role id is required."],
        },
    },
    { timestamps: true } 
);

PermissionSchema.index({ role_id: 1 })

const Permission: Model<PermissionAttributes> = mongoose.model(
    "Permission",
    PermissionSchema
);

export default Permission;