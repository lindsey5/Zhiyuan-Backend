import { NextFunction, Request, Response } from "express";
import AuditLog from "../database/models/AuditLog";

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
        const role = req.query.role as string;
        const severity = req.query.severity as string;
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

        // Build filter
        const filter: any = {};

        if (search) {
            filter.$or = [
                { action: { $regex: search, $options: "i" } },
                { "user.firstname": { $regex: search, $options: "i" } },
                { "user.lastname": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        if (role) filter.role = role;
        if (severity) filter.severity = severity;

        // Count total documents
        const total = await AuditLog.countDocuments(filter);

        // Fetch audit logs with user info
        const auditLogs = await AuditLog.find(filter)
        .populate({
            path: "user",
            select: "-password",
        })
        .sort({ createdAt: order })
        .skip(skip)
        .limit(limit)

        res.status(200).json({
            success: true,
            auditLogs,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
};