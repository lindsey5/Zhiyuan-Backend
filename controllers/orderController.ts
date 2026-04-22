import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import '../models/OrderItem';
import { setEndDate, setStartDate } from "../utils/utils";
import Variant from "../models/Variant";
import OrderItem from "../models/OrderItem";
import mongoose from "mongoose";
import User from "../models/User";
import UserNotification from "../models/UserNotification";
import PERMISSIONS from "../utils/permissions";
import OrderNotification from "../models/OrderNotification";
import { emitOrderNotification } from "../sockets/orderSocket";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { items, ...rest } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Order items are required",
            });
        }

        // validate variants (must use session)
        for (const item of items) {
            const variant = await Variant.findOne({
                _id: item.variant_id,
                status: "active",
            }).session(session);

            if (!variant) {
                await session.abortTransaction();
                session.endSession();

                return res.status(404).json({
                    success: false,
                    message: `Variant not found: ${item.variant_id}`,
                });
            }
        }

        const total_amount = items.reduce(
            (total: number, item: any) => total + (Number(item.amount) || 0),
            0
        );

        const order = await Order.create(
            [
                {
                    ...rest,
                    total_amount,
                },
            ],
            { session }
        );

        await OrderItem.insertMany(
            items.map((item: any) => ({
                ...item,
                order_id: order[0]._id,
            })),
            { session }
        );

        const order_items = await OrderItem.find({ order_id: order[0]._id })
            .populate({
                path: "variant",
                populate: { path: "product" },
            })
            .session(session);

        // must use session
        const users = await User.find({ status: "active" })
            .populate({
                path: "role",
                populate: { path: "permissions" },
            })
            .session(session);

        const authorizedUsers = users.filter((user) =>
            user.role?.permissions?.some(
                (p) =>
                    p.action === PERMISSIONS.ORDER_READ_ALL ||
                    p.action === PERMISSIONS.ORDER_UPDATE
            )
        );

        for (const user of authorizedUsers) {
            const userNotification = await UserNotification.create(
                [
                    {
                        user_id: user._id,
                        message: `New order created: ${order[0].order_id}`,
                    },
                ],
                { session }
            );

            const orderNotification = await OrderNotification.create(
                [
                    {
                        order_id: order[0]._id,
                        notification_id: userNotification[0]._id,
                    },
                ],
                { session }
            );

            await orderNotification[0].populate({
                path: "order",
                populate: {
                    path: "order_items",
                    populate: {
                        path: "variant",
                        populate: "product",
                    },
                },
            });

            await emitOrderNotification(
                userNotification[0],
                orderNotification[0],
                user.id
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Order successfully created",
            order: {
                ...order[0].toJSON(),
                order_items,
            },
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const skip = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search) : "";
        const status = req.query.status ? String(req.query.status) : "";
        const paymentMethod = req.query.paymentMethod ? String(req.query.paymentMethod) : "";
        const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus) : "";
        const deliveryType = req.query.deliveryType ? String(req.query.deliveryType) : "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await Order.updateMany(
            { createdAt: { $lt: today }, status: 'pending' }, 
            { $set: { status: 'expired' } }
        )

        const filter: any = {};

        if (search) {
            filter.$or = [
                { customer_name: { $regex: search, $options: "i" } },
                { order_id: { $regex: search, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        if (status) filter.status = status;
        if (paymentMethod) filter.payment_method = paymentMethod;
        if (paymentStatus) filter.payment_status = paymentStatus;
        if(deliveryType) filter.delivery_type = deliveryType;

        const total = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .populate({
                path: "order_items",
                populate: {
                    path: 'variant',
                    populate: 'product'
                }
            }) 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            orders,
        });
    } catch (err) {
        next(err);
    }
};

export const orderMarkAsPaid = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const order = await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if(order.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                message: "This order is already paid"
            })
        }

        order.payment_status = 'paid'

        if(order.delivery_type === 'pickup'){
            order.status = 'completed'
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order successfully marked as paid",
        })

    }catch(err){
        next(err);
    }
}

export const updateOrderStatus= async (req: Request, res: Response, next: NextFunction) => {
    try{
        const order = await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        order.status = req.body.status;

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order ${order.order_id} successfully marked as ${req.body.status}`
        })

    }catch(err){
        next(err);
    }
}