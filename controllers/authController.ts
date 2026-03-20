import { NextFunction, Request, Response } from "express";
import { User } from '../models/index';
import { generateAccessToken, generateRefreshToken } from "../utils/auth";

export const login = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email
            }
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

        const { password : userPassword, role_id, id, ...rest } = userData
        
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