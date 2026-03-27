import { NextFunction, Request, Response } from "express";
import { AuditLog, User } from '../database/models/index';
import { Op } from "sequelize";

export const getAuditLogs = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : "";
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : "";
        const role = req.query.role;
        const severity = req.query.severity;      
        const order =
        req.query.order && String(req.query.order).toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

        const whereCondition : any = {};
        
        if(search){
            whereCondition[Op.or] = [
                { action: { [Op.like]: `%${search}%` } },
                { "$user.firstname$": { [Op.like]: `%${search}%` } },
                { "$user.lastname$": { [Op.like]: `%${search}%` } },
                { "$user.email$": { [Op.like]: `%${search}%` } },
            ]
        }

        if (startDate || endDate) {
            whereCondition.createdAt = {};

            if (startDate) whereCondition.createdAt[Op.gte] = startDate;
            if (endDate) whereCondition.createdAt[Op.lte] = endDate;
        }

        if(role) {
            whereCondition.role = role;
        }

        if(severity){
            whereCondition.severity = severity;
        }

        const total = await AuditLog.count({
            include: [
                {
                    model: User,
                    as: "user",
                },
            ],
            where: whereCondition,
        });

        const auditLogs = await AuditLog.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: { exclude: ["password"] }
                }
            ],
            where: whereCondition,
            limit,
            offset,
            order: [['createdAt', order]],
            subQuery: false,
        });

        res.status(200).json({
            success: true,
            auditLogs: auditLogs.map(audit => ({
                ...audit.toJSON(), 
                old_values: JSON.parse(audit.toJSON().old_values || ""),
                new_values: JSON.parse(audit.toJSON().new_values || "")
            })),
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
            order: [['createdAt', order]]
        })

    }catch(err){
        next(err)
    }
}