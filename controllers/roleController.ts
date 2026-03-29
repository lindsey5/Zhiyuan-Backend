import { NextFunction, Request, Response } from "express";
import { Permission, Role, User } from "../database/models/index";
import PERMISSIONS from "../utils/permissions";
import { AuthRequest } from "../types/auth";
import AuditLogService from "../services/AuditLogService";

export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { permissions, ...rest } = req.body;

        if (!Array.isArray(permissions)) {
            res.status(400).json({ success: false, message: "Permissions must be an array" });
            return;
        }

        if (permissions.length === 0) {
            res.status(400).json({
                success: false,
                message: "Role must have at least one permission."
            });
            return;
        }

        const invalidPermissions = permissions.filter(
            (permission: string) => !Object.values(PERMISSIONS).includes(permission)
        );

        if (invalidPermissions.length > 0) {
            res.status(400).json({
                success: false,
                message: "Some permissions are invalid",
                invalid: invalidPermissions,
                allowed: Object.values(PERMISSIONS)
            });
            return;
        }

        const newRole = await Role.create(rest);

        const newPermissions = await Permission.bulkCreate(
            permissions.map(permission => ({
                action: permission,
                role_id: newRole.toJSON().id
            }))
        );

        const roleData = {
            ...newRole.toJSON(),
            permissions: newPermissions.map(p => p.toJSON())
        };

        await AuditLogService.log({
            action: "CREATE_ROLE",
            description: `Role "${roleData.name}" successfully created with ${permissions.length} permissions.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name|| "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user.id,
            old_values: null,
            new_values: roleData
        });

        return res.status(201).json({
            success: true,
            message: 'Role successfully created',
            role: newRole,
            permissions: newPermissions,
        });

    } catch (err) {
        next(err);
    }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { permissions, ...rest } = req.body;

        const role = await Role.findByPk(req.params.id as string);

        if (!role) {
            res.status(404).json({
                message: 'Role not found.'
            });
            return;
        }

        if (!Array.isArray(permissions)) {
            res.status(400).json({
                success: false,
                message: "Permissions must be an array"
            });
            return;
        }

        if (permissions.length === 0) {
            res.status(400).json({
                success: false,
                message: "Role must have at least one permission."
            });
            return;
        }

        const invalidPermissions = permissions.filter(
            (permission: string) => !Object.values(PERMISSIONS).includes(permission)
        );

        if (invalidPermissions.length > 0) {
            res.status(400).json({
                success: false,
                message: "Some permissions are invalid",
                invalid: invalidPermissions,
                allowed: Object.values(PERMISSIONS)
            });
            return;
        }

        const oldValues = {
            ...role.toJSON()
        };

        const oldPermissions = await Permission.findAll({
            where: { role_id: role.toJSON().id }
        });

        role.set(rest);
        await Permission.destroy({
            where: {
                role_id: role.toJSON().id
            }
        });

        await role.save();

        const updatedPermissions = await Permission.bulkCreate(
            permissions.map(permission => ({
                action: permission,
                role_id: role.toJSON().id,
            }))
        );

        const newValues = {
            ...role.toJSON(),
            permissions: updatedPermissions.map(p => p.toJSON())
        };

        await AuditLogService.log({
            action: "UPDATE_ROLE",
            description: `Role "${oldValues.name}" successfully updated.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user.id,
            old_values: {
                ...oldValues,
                permissions: oldPermissions.map(p => p.toJSON())
            },
            new_values: newValues
        });

        return res.status(200).json({
            success: true,
            message: 'Role successfully updated',
            role: newValues
        });

    } catch (err) {
        next(err);
    }
};

export const getRoleById = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const role = await Role.findByPk(req.params.id as string, {
            include: [
                {
                    model: Permission,
                    as: 'permissions'
                }
            ]
        })

        res.status(200).json({ 
            success: true,
            role
        })

    }catch (err) {
        next(err);
    }
}

export const getAllRoles = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const roles = await Role.findAll({
            include: [
                {
                    model: Permission,
                    as: 'permissions'
                },
                {
                    model: User,
                    as: 'users'
                }
            ]
        })

        res.status(200).json({
            success: true,
            roles
        })

    }catch (err) {
        next(err);
    }
}

export const deleteRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const role = await Role.findByPk(req.params.id as string, {
            include: [{ model: Permission, as: "permissions" }]
        });

        if (!role) {
            res.status(404).json({
                success: false,
                message: 'Role not found.'
            });
            return;
        }

        const oldValues = {
            ...role.toJSON()
        };

        await role.destroy();

        await AuditLogService.log({
            action: "DELETE_ROLE",
            description: `Role "${oldValues.name}" successfully deleted.`,
            ip_address: req.ip || "N/A",
            role: req.user?.role?.name || "N/A",
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user.id,
            old_values: oldValues,
            new_values: null
        });

        return res.status(200).json({
            success: true,
            message: 'Role successfully deleted.'
        });

    } catch (err) {
        next(err);
    }
};

export const getOwnRole = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const user = await User.findByPk(req.user.id);

        if(!user){
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const role = await Role.findByPk(user.toJSON().role_id, {
            include: [
                {
                    model: Permission,
                    as: 'permissions'
                }
            ]
        })

        if(!role){
            res.status(404).json({
                success: false,
                message: 'No role found.',
            }); 
            return
        }

        const { permissions, ...roleData } = role?.toJSON() as any;

        res.status(200).json({
            success: true,
            role: roleData,
            permissions: permissions.map((permission : any) => permission.action)
        })

    }catch(err){
        next(err);
    }
}