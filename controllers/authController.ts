import { NextFunction, Request, Response } from "express";
import { Permission, Role, User } from '../models/index';
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import { UserWithRole } from "../types/model-attributes";

export const login = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email
            },
            include:[
                {
                    model: Role,
                    as: 'role',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['action']
                        }
                    ]
                }
            ]
        })

        if(!user){
            res.status(401).json({ 
                success: false,
                message: 'User not found.' 
            });
            return;   
        }

        if(!(await user.matchPassword(password))){
            res.status(401).json({ 
                success: false,
                message: 'Incorrect password.' 
            });
            return;
        }

        const userData : any = user.toJSON();
        const accessToken = generateAccessToken(userData.id, userData.role?.role as string);
        const refreshToken = generateRefreshToken(userData.id);

        const { password : userPassword, ...rest } = userData

        res.status(200).json({
            success: true,
            user: rest,
            token: {
                accessToken,
                refreshToken
            }
        })

    }catch(err : any){
       next(err);
    }
}