import { NextFunction, Request, Response } from "express";
import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = (req.query.search as string) || "";
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
        const role = req.query.role as string;
        const severity = req.query.severity as string;
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

        // Base match filter
        const matchStage: any = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = startDate;
            if (endDate) matchStage.createdAt.$lte = endDate;
        }
        if (role) matchStage.role = role;
        if (severity) matchStage.severity = severity;

        // Build aggregation pipeline
        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                from: "users",           
                localField: "user_id",
                foreignField: "_id",
                as: "user"
                }
            },
            { $unwind: { path: "$user" } }
        ];

        // Search filter
        if (search) {
            pipeline.push({
                $match: {
                $or: [
                    { action: { $regex: search, $options: "i" } },
                    { "user.firstname": { $regex: search, $options: "i" } },
                    { "user.lastname": { $regex: search, $options: "i" } },
                    { "user.email": { $regex: search, $options: "i" } }
                ]
                }
            });
        }

        // Count total documents after filters
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await AuditLog.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Add sort, skip, limit for pagination
        pipeline.push(
            { $sort: { createdAt: order } },
            { $skip: skip },
            { $limit: limit },
            // Project to remove password from user
            {
                $project: {
                "user.password": 0
                }
            }
        );

        // Fetch audit logs
        const auditLogs = await AuditLog.aggregate(pipeline);

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