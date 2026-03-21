import { NextFunction, Request, Response } from "express";
import { Permission, Role, User } from '../models/index';
import { AuthRequest } from "../types/auth";
import { Op } from "sequelize";

export const createUser = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const user = req.body;

        const role = await Role.findByPk(user.role_id);

        if(!role){
            res.status(404).json({
                success: false,
                message: 'Role id not found or exist.'
            })
            return;
        }

        const newUser = await User.create(user);

        res.status(201).json({ 
            success: true, 
            message: 'User successfully created',
            user: newUser 
        });

    }catch(err : any){
        next(err);
    }
}

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

export const updateUser = async (req : Request, res : Response, next : NextFunction) => {
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

        user.set(req.body);
        await user.save();
        const updatedUser = user.toJSON();

        res.status(200).json({
            success: true,
            message: 'User successfully updated',
            updatedUser
        });


    }catch(err : any){
        next(err);
    }
}

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

export const deleteUser = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const user = await User.findByPk(req.params.id as string);

        if(!user){
            res.status(404).json({ 
                success: false,
                message: 'User not found.'
            });
            return;
        }

        await user.destroy();

        res.status(200).json({ success: true, message: 'User successfully deleted.' });

    }catch(err : any){
        next(err);
    }
}