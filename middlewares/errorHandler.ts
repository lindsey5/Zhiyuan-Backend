import { NextFunction, Request, Response } from "express";
import {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError
} from "sequelize";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
 ) => {
    console.error(err);

    // Sequelize Validation Error
    if (err instanceof ValidationError) {
        res.status(400).json({
            success: false,
            error: "Validation error",
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
        return;
    }

    // Sequelize Unique Constraint
    if (err instanceof UniqueConstraintError) {
        res.status(409).json({
            success: false,
            error: "Duplicate value",
            message: `${err.errors[0]?.path} already exists.`
        });
        return;
    }

    // Foreign key error
    if (err instanceof ForeignKeyConstraintError) {
        res.status(400).json({
            success: false,
            error: "Invalid reference",
            message: err.message
        });
        return;
    }

    // Database error
    if (err instanceof DatabaseError) {
        res.status(500).json({
            success: false,
            error: "Database error",
            message: err.message
        });
        return;
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
    return;
};