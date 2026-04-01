import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);

    // Mongoose Validation Error
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            details: Object.values(err.errors).map((e: any) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    // Duplicate Key Error (Unique)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        return res.status(409).json({
            success: false,
            error: "Duplicate value",
            message: `${field} already exists.`,
        });
    }

    // CastError (Invalid ObjectId, wrong type)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            error: "Invalid ID",
            message: `Invalid value for field "${err.path}"`,
        });
    }

    // MongoServerError (general DB error)
    if (err.name === "MongoServerError") {
        return res.status(500).json({
            success: false,
            error: "Database error",
            message: err.message,
        });
    }

    // Default error
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};