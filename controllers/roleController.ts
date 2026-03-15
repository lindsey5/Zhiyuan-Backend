import { NextFunction, Request, Response } from "express";
import { Permission, Role } from "../models/index";
import PERMISSIONS from "../utils/permissions";

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { permissions, ...rest } = req.body;

        if (!Array.isArray(permissions)) {
            res.status(400).json({ success: false, message: "Permissions must be an array" });
            return;
        }

        if(permissions.length === 0){
            res.status(400).json({
                success: false,
                message: "Role must have at least one permission."
            });
            return;
        }

        const invalidPermissions = permissions.filter((permission: string) => !Object.values(PERMISSIONS).includes(permission));

        if (invalidPermissions.length > 0) {
            res.status(400).json({
                success: false,
                message: "Some permissions are invalid",
                invalidPermissions,
                acceptedPermissions: Object.values(permissions)
            });
            return;
        }

        const newRole = await Role.create(rest);


        const newPermissions = await Permission.bulkCreate(permissions.map(permission => ({
            action: permission,
            role_id: newRole.id
        })))

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            role: newRole.toJSON(),
            permissions: newPermissions,
        });

    } catch (err) {
        next(err);
    }
};

export const updateRole = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { permissions, ...rest } = req.body;
        const role = await Role.findByPk(req.params.id as string);

        if(!role){
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

        if(permissions.length === 0){
            res.status(400).json({
                success: false,
                message: "Role must have at least one permission."
            });
            return;
        }

        const invalidPermissions = req.body.permissions.filter((permission: string) => !Object.values(PERMISSIONS).includes(permission));

        if (invalidPermissions.length > 0) {
            res.status(400).json({
                success: false,
                message: "Some permissions are invalid",
                invalidPermissions,
                acceptedPermissions: Object.values(permissions)
            });
            return;
        }

        role.set(rest);
        await Permission.destroy({
            where: {
                role_id: role.id
            }
        })

        await role.save();
        const updatedPermissions = await Permission.bulkCreate(permissions.map(permission => ({
            action: permission,
            role_id: role.id,
        })))

        res.status(200).json({
            success: true,
            role: {
                ...role.toJSON(),
                permissions: updatedPermissions
            }
        })


    } catch (err) {
        next(err);
    }
}

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

export const deleteRole = async (req : Request, res : Response, next : NextFunction) =>{
    try{
        const role = await Role.findByPk(req.params.id as string);

        if(!role){
            res.status(404).json({
                success: false,
                message: 'Role not found.'
            })
            return;
        }

        await role.destroy();

        res.status(200).json({
            success: true,
            message: 'Role successfully deleted.'
        })

    }catch (err) {
        next(err);
    }
}