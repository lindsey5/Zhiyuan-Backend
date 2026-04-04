import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/auth";
import { UserAttributes } from "../types/model-attributes";

const UserSchema: Schema<UserAttributes> = new Schema(
    {
        firstname: {
            type: String,
            required: [true, "firstname is required."],
            minlength: [1, "firstname must be at least 1 character."],
            maxlength: [100, "firstname must be at most 100 characters."],
            trim: true,
        },

        lastname: {
            type: String,
            required: [true, "lastname is required."],
            minlength: [1, "lastname must be at least 1 character."],
            maxlength: [100, "lastname must be at most 100 characters."],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "email is required."],
            minlength: [5, "email must be at least 5 characters."],
            maxlength: [100, "email must be at most 100 characters."],
            trim: true,
        },

        password: {
            type: String,
            required: [true, "password is required."],
        },

        role_id: {
           type: Schema.Types.ObjectId,
            ref: "Role",
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

UserSchema.pre<UserAttributes>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
    next();
});

UserSchema.methods.matchPassword = async function (
    plainPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
};

UserSchema.virtual("role", {
    ref: "Role",
    localField: "role_id",
    foreignField: "_id",
    justOne: true,
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

const User: Model<UserAttributes> = mongoose.model("User", UserSchema);

export default User;