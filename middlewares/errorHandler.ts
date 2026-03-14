import { Request, Response, NextFunction } from "express";
import {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError
} from "sequelize";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
 ) => {
    console.error(err);

    // Sequelize Validation Error
    if (err instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Sequelize Unique Constraint
    if (err instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            error: "Duplicate value",
            message: `${err.errors[0]?.path} already exists.`
        });
    }

    // Foreign key error
    if (err instanceof ForeignKeyConstraintError) {
        return res.status(400).json({
            success: false,
            error: "Invalid reference",
            message: err.message
        });
    }

    // Database error
    if (err instanceof DatabaseError) {
        return res.status(500).json({
            success: false,
            error: "Database error",
            message: err.message
        });
    }

    // Default error
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};