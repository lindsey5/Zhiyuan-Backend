import { NextFunction, Request, Response } from "express";
import { Distributor, Role, User } from '../database/models/index';
import { generateAccessToken, generateDistributorAccessToken, generateRefreshToken } from "../utils/auth";
import jwt from 'jsonwebtoken';

export const login = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email,
                status: 'active'
            },
            include: [
                {
                    model: Role,
                    as: 'role'
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
        const accessToken = generateAccessToken(userData.id, userData.role_id);
        const refreshToken = generateRefreshToken(userData.id);

        const { password : userPassword, id, role, ...rest } = userData
        
        res.status(200).json({
            success: true,
            user: {
                ...rest,
                role: role?.name,
            },
            token: {
                accessToken,
                refreshToken
            }
        })

    }catch(err : any){
        next(err);
    }
}

export const refreshAccessToken = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const refreshToken = req.body.refreshToken;

        if(!refreshToken){
            res.status(401).json({ success: false, message: 'Refresh token required' });
            return;
        }

        const decoded : any = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key'
        );
        const user = await User.findByPk(decoded.id as string, {
            include: [
                {
                    model: Role,
                    as: 'role'
                }
            ]
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const userData : any = user.toJSON();
        const newRefreshToken = generateRefreshToken(Number(decoded.id));
        const newAccessToken = generateAccessToken(Number(decoded.id), userData.role_id);

        const { password : userPassword, id, role, ...rest } = userData
        
        res.status(200).json({
            success: true,
            user: {
                ...rest,
                role: role?.name
            },
            token: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        })
    }catch(err : any){
        next(err);
    }
}

export const distributorLogin = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const { email, password } = req.body;

        const distributor = await Distributor.findOne({
            where: {
                email,
                status: 'active'
            },
        })

        if(!distributor){
            res.status(401).json({ 
                success: false,
                message: 'User not found.' 
            });
            return;   
        }

        if(!(await distributor.matchPassword(password))){
            res.status(401).json({ 
                success: false,
                message: 'Incorrect password.' 
            });
            return;
        }

        const distributorData : any = distributor.toJSON();
        const accessToken = generateDistributorAccessToken(distributorData.id);
        const refreshToken = generateRefreshToken(distributorData.id);

        const { password : distributorPassword, id, ...rest } = distributorData
        
        res.status(200).json({
            success: true,
            distributor: rest,
            token: {
                accessToken,
                refreshToken
            }
        })

    }catch(err : any){
        next(err);
    }
}

export const distributorRefreshAccessToken = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const refreshToken = req.body.refreshToken;

        if(!refreshToken){
            res.status(401).json({ success: false, message: 'Refresh token required' });
            return;
        }

        const decoded : any = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key'
        );
        const distributor = await Distributor.findByPk(decoded.id as string);

        if (!distributor) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const distributorData : any = distributor.toJSON();
        const newRefreshToken = generateRefreshToken(Number(decoded.id));
        const newAccessToken = generateDistributorAccessToken(Number(decoded.id));

        const { password : userPassword, id, ...rest } = distributorData
        
        res.status(200).json({
            success: true,
            distributor: rest,
            token: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        })
    }catch(err : any){
        next(err);
    }
}