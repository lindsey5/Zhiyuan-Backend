import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/auth";
import { DistributorAttributes } from "../types/model-attributes";

const DistributorSchema: Schema<DistributorAttributes> = new Schema(
    {
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
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [5, "email must be between 5 and 100 characters."],
            maxlength: [100, "email must be between 5 and 100 characters."],
            match: [/^\S+@\S+\.\S+$/, "invalid email address"],
        },

        password: {
            type: String,
            required: [true, "password is required"],
            minlength: [6, "password must be between 6 to 50 characters."],
            maxlength: [50, "password must be between 6 to 50 characters."],
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
    const distributor = this;

    if (!distributor.isModified("password")) return next();

    distributor.password = await hashPassword(this.password);

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