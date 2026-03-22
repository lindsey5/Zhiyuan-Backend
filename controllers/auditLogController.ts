import { NextFunction, Request, Response } from "express";
import { AuditLog, User } from '../models/index';

export const getAuditLogs = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const auditLogs = await AuditLog.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                }
            ]
        })

        res.status(200).json({
            success: true,
            auditLogs
        })

    }catch(err){
        next(err)
    }
}