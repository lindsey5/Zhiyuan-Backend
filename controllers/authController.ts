import { Request, Response } from "express";
import { Permission, Role, User } from '../models/index';
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import { UserWithRole } from "../types/types";

export const login = async (req : Request, res : Response) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({
            attributes: { exclude: ["password"] },
            where: {
                email
            },
            include:[
                {
                    model: Role,
                    include: [
                        {
                            model: Permission
                        }
                    ]
                }
            ]
        })

        if(!user){
            res.status(401).json({ error: 'User not found.' });
            return;   
        }

        if(!(await user.matchPassword(password))){
            res.status(401).json({ error: 'Incorrect password.' });
            return;
        }

        const userData : UserWithRole = user.toJSON();
        const accessToken = generateAccessToken(userData.id, userData.role?.name as string);
        const refreshToken = generateRefreshToken(userData.id);

        res.status(200).json({
            success: true,
            user: userData,
            token: {
                accessToken,
                refreshToken
            }
        })

    }catch(err : any){
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}