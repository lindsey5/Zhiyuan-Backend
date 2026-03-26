import { NextFunction, Request, Response } from "express";
import { AuditLog, User } from '../database/models/index';

export const getAuditLogs = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const auditLogs = await AuditLog.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ["password"] },
                }
            ]
        })

        res.status(200).json({
            success: true,
            auditLogs: auditLogs.map(audit => ({
                ...audit.toJSON(), 
                old_values: JSON.parse(audit.toJSON().old_values || ""),
                new_values: JSON.parse(audit.toJSON().new_values || "")
            }))
        })

    }catch(err){
        next(err)
    }
}