import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { Order, OrderItem } from "../database/models/index";

export const getOrders = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const offset = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search) : "";
        const status = req.query.status ? String(req.query.status) : "";
        const paymentMethod = req.query.paymentMethod ? String(req.query.paymentMethod) : "";
        const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus) : "";

        const whereCondition : any = {}

        if(search){
            whereCondition[Op.or] = [
                { customer_name: { [Op.like] : `%${search}%`}},
                { order_id: { [Op.like] : `%${search}%`}}
            ]
        }

        if(status){
            whereCondition.status = status;
        }

        if(paymentMethod){
            whereCondition.payment_method = paymentMethod;
        }

        if(paymentStatus){
            whereCondition.payment_status = paymentStatus;
        }

        const total = await Order.count({ where: whereCondition });

        const orders = await Order.findAll({
            where: whereCondition,
            include: [
                {
                    model: OrderItem,
                    as: 'order_items'
                }
            ],
            order: [['order_date', 'DESC']],
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
            orders,
        })

    }catch(err){
        next(err);
    }
}