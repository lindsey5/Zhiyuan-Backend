import { Request, Response } from "express";
import { Permission, Role, User } from '../models/index';

export const createUser = async (req : Request, res : Response) => {
    try{
        const user = req.body;

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