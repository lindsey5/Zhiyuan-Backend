import { NextFunction, Request, Response } from "express";
import { Distributor, User } from '../database/models';
import { AuthRequest } from "../types/auth";
import { generatePassword } from "../utils/utils";
import { Op } from "sequelize";
import { sendDistributorAccountEmail } from "../services/EmailService";
import { success } from "zod";

export const createDistributor = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const existingDistributor = await Distributor.findByPk(req.user.id);

        const password = generatePassword(10);

        await sendDistributorAccountEmail({
            email: req.body.email,
            password,
            name: req.body.distributor_name
        })

        const distributor = await Distributor.create({
            ...req.body,
            password,
            parent_distributor_id: existingDistributor ? req.user.id : null,
            creator: existingDistributor ? null : req.user.id
        })

        res.status(201).json({
            success: true,
            message: "Distributor successfully created",
            distributor
        })

    }catch(err){
        next(err);
    }
} 

export const getDistributors = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";

        const whereCondition: any = {
            status: "active",
        };

        if (search) {
            whereCondition.distributor_name = { [Op.like]: `%${search}%` };
        }

        const total = await Distributor.count({
            where: whereCondition
        })

        const distributors = await Distributor.findAll({
            where: whereCondition,
            attributes: {
                exclude: ['password', 'parent_distributor_id']
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password', 'id']
                    },
                },
                {
                    model: Distributor,
                    as: 'recruiter',
                    attributes: {
                        exclude: ['password', 'id', 'parent_distributor_id']
                    },
                }
            ],
            limit,
            offset
        })

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            distributors
        });

    }catch(err){
        next(err);
    }
}

export const updateDistributor = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const existingEmail = await Distributor.findOne({
            where: {
                id: { [Op.ne] : Number( req.params.id) },
                email: req.body.email
            }
        })

        if(existingEmail){
            return res.status(409).json({
                success: false,
                message: 'Email already exists.'
            })
        }

        const distributor = await Distributor.findByPk(req.params.id as string);

        if(!distributor){
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            })
        }

        distributor.set(req.body);

        await distributor.save();

        res.status(200).json({
            success: true,
            message: 'Distributor successfully updated',
            distributor
        });


    }catch(err){
        next(err);
    }
}