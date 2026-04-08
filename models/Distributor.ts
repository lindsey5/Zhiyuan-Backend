import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/auth";
import { DistributorAttributes } from "../types/model-attributes";

const DistributorSchema: Schema<DistributorAttributes> = new Schema(
    {
        distributor_id: {
            type: String,
            unique: true,
        },
        parent_distributor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Distributor',
            required: false
        },

        distributor_name: {
            type: String,
            required: [true, "Distributor name is required."],
            minlength: [1, "Distributor name must be between 1 and 100 characters."],
            maxlength: [100, "Distributor name must be between 1 and 100 characters."],
            trim: true,
        },

        commission_rate: {
            type: Number,
            required: true,
            default: 5,
        },

        wallet_balance: {
            type: Number,
            required: true,
            default: 0,
        },

        email: {
            type: String,
            required: [true, "email is required."],
            lowercase: true,
            trim: true,
            minlength: [5, "email must be between 5 and 100 characters."],
            maxlength: [100, "email must be between 5 and 100 characters."],
            match: [/^\S+@\S+\.\S+$/, "invalid email address"],
        },

        password: {
            type: String,
            required: [true, "password is required"],
        },

        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active",
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

DistributorSchema.index({ status: 1, createdAt: -1 });
DistributorSchema.index({ status: 1, distributor_name: 1 });
DistributorSchema.index({ status: 1, email: 1 });
DistributorSchema.index({ status: 1, wallet_balance: -1 });
DistributorSchema.index({ parent_distributor_id: 1 });
DistributorSchema.index({ distributor_name: "text", email: "text" });

DistributorSchema.virtual("stocks", {
    ref: "DistributorStock",          
    localField: "_id", 
    foreignField: "distributor_id",       
});

DistributorSchema.virtual("parent_distributor", {
    ref: "Distributor",          
    localField: "_id", 
    foreignField: "parent_distributor_id",   
    justOne: true    
});

DistributorSchema.set("toObject", { virtuals: true });
DistributorSchema.set("toJSON", { virtuals: true });

DistributorSchema.pre("save", async function (next) {
    const distributor = this as any;

    // Generate distributor_id if not set
    if (!distributor.distributor_id) {
        let unique = false;
        while (!unique) {
            const randomId = `DIST-${Math.floor(100000 + Math.random() * 900000)}`;
            
            // Check if it already exists in the DB
            const existing = await Distributor.findOne({ distributor_id: randomId });
            if (!existing) {
                distributor.distributor_id = randomId;
                unique = true;
            }
        }
    }

    // Hash password if modified
    if (distributor.isModified("password")) {
        distributor.password = await hashPassword(distributor.password);
    }

    next();
});

DistributorSchema.methods.matchPassword = async function (
    plainPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
};

const Distributor: Model<DistributorAttributes> = mongoose.model(
    "Distributor",
    DistributorSchema
);

export default Distributor;