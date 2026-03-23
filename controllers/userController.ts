import { NextFunction, Request, Response } from "express";
import { Permission, Role, User } from '../models/index';
import { AuthRequest } from "../types/auth";
import { Op } from "sequelize";
import AuditLogService from "../services/AuditLogService";

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.body;

        const role = await Role.findByPk(user.role_id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role id not found or exist.'
            });
        }

        const newUser = await User.create(user);

        await AuditLogService.log({
            action: "CREATE_USER",
            description: `User successfully created with role_id ${user.role_id}.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "CRITICAL",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user.id,
            new_values: newUser,
            old_values: null
        });

        return res.status(201).json({
            success: true,
            message: 'User successfully created',
            user: newUser
        });

    } catch (err: any) {            
        next(err);
    }
};

export const getUsers = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const users = await User.findAll({
            where: {
                id: { [Op.ne] : req.user.id}
            },
            attributes: {
                exclude: ['password']
            },
            include: [
                { 
                    model: Role,
                    as: 'role',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                        }
                    ]
                }
            ]
        });

        res.status(200).json({ success: true, users });

    }catch(err : any){
        next(err);
    }
}

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findByPk(req.params.id as string, {
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const oldValues = user.toJSON();

        user.set(req.body);
        await user.save();

        const updatedUser = user.toJSON();

        await AuditLogService.log({
            action: "UPDATE_USER",
            description: `User ID ${req.params.id} successfully updated.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user.id,
            old_values: oldValues,
            new_values: updatedUser
        });

        return res.status(200).json({
            success: true,
            message: 'User successfully updated',
            updatedUser
        });

    } catch (err: any) {
        next(err);
    }
};

export const getUserById = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const user = await User.findByPk(req.params.id as string, {
            attributes: {
                exclude: ['password']
            },
        });

        if(!user){
             res.status(404).json({ 
                success: false,
                message: 'User not found.'
            });
            return;
        }

        res.status(200).json({ success: true, user });
    }catch(err : any){
        next(err);
    }
}

export const userGetOwn= async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: Role,
                    as: 'role',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions'
                        }
                    ]
                }
            ]
        });

        res.status(200).json({ success: true, user });
    }catch(err : any){
        next(err);
    }
}

export const userUpdateOwn = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const existingEmail = await User.findOne({
            where:{
                email: req.body.email,
                id: { [Op.ne] : req.user.id}
            }
        })
        if(existingEmail){
            res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            })
            return;
        }

        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: Role,
                    as: 'role'
                }
            ]
        });

        if(!user){
            res.status(404).json({ 
                success: false,
                message: 'User not found.'
            });
            return;
        }

        user.set(req.body);
        await user.save();
        const updatedUser : any = user.toJSON();
        const { role, ...rest } = updatedUser;

        res.status(200).json({ 
            success: true, 
            message: 'Successfully Updated',
            user:  {
                ...rest,
                role: role?.name
            }
        });
    }catch(err : any){
        next(err);
    }
}

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findByPk(req.params.id as string);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const oldValues = user.toJSON();

        await user.destroy();

        await AuditLogService.log({
            action: "DELETE_USER",
            description: `User with ID ${req.params.id} successfully deleted.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "CRITICAL",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user.id,
            old_values: oldValues,
            new_values: null
        });

        return res.status(200).json({
            success: true,
            message: 'User successfully deleted.'
        });

    } catch (err: any) {
        next(err);
    }
};