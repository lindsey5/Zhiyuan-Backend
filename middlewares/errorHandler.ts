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
    next: NextFunction
    ) => {
    console.error(err);

    // Sequelize Validation Error
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: "Validation error",
            message: err.errors[0].message,
        });
    }

    // Sequelize Unique Constraint
    if (err instanceof UniqueConstraintError) {
        return res.status(409).json({
            error: "Duplicate value",
            message: `${err.errors[0]?.path} already exists.`
        });
    }

    // Foreign key error
    if (err instanceof ForeignKeyConstraintError) {
        return res.status(400).json({
            error: "Invalid reference",
            message: err.message
        });
    }

    // Database error
    if (err instanceof DatabaseError) {
        return res.status(500).json({
            error: "Database error",
            message: err.message
        });
    }

    // Default error
    return res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
};