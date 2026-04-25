import mongoose, { Schema, Model } from "mongoose";

export interface ReviewAttributes {
    name: string;
    rating: number;
    review: string;
}

const ReviewSchema: Schema<ReviewAttributes> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

ReviewSchema.index({ createdAt: 1 });

const Review: Model<ReviewAttributes> = mongoose.model("Review", ReviewSchema);

export default Review;