import { Request, Response } from "express";
import { Permission, Role, User } from '../models/index';
import { AuthRequest } from "../types/auth";


export const createUser = async (req : Request, res : Response) => {
    try{
        const user = req.body;

        const existingRole = await Role.findByPk(user.role_id);

        if(!existingRole){
            res.status(404).json({ error: 'Role not exist.'});
            return;
        }

        const newUser = await User.create(user);

        res.status(201).json({ success: true, user: newUser });

    }catch(err : any){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const getUsers = async (req : Request, res : Response) => {
    try{
        const users = await User.findAll({
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
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const updateUser = async (req : Request, res : Response) => {
    try{
        const { password, ...rest } = req.body;
        const user = await User.findByPk(req.params.id as string);

        if(!user){
            res.status(404).json({ error: 'User not found.'});
            return;
        }

        user.set(rest);
        await user.save();
        const updatedUser = user.toJSON();

        res.status(200).json({
            success: true,
            updatedUser
        });


    }catch(err : any){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const getUserById = async (req : Request, res : Response) => {
    try{
        const user = await User.findByPk(req.params.id as string);

        if(!user){
             res.status(404).json({ error: 'User not found.'});
            return;
        }

        res.status(200).json({ success: true, user });
    }catch(err : any){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const userGetOwn= async (req : AuthRequest, res : Response) => {
    try{
        const user = await User.findByPk(req.user.id, {
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
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const userUpdateOwn = async (req : AuthRequest, res : Response) => {
    try{
        const { password, ...rest } = req.body;
        const user = await User.findByPk(req.user.id);

        if(!user){
            res.status(404).json({ error: 'User not found.'});
            return;
        }

        user?.set(rest);
        await user.save();
        const updatedUser = user.toJSON();

        res.status(200).json({ success: true, user: updatedUser });
    }catch(err : any){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

export const deleteUser = async (req : Request, res : Response) => {
    try{
        const user = await User.findByPk(req.params.id as string);

        if(!user){
            res.status(404).json({ error: 'User not found.'});
            return;
        }

        await user.destroy();

        res.status(200).json({ success: true, message: 'User successfully deleted.' });

    }catch(err : any){
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}