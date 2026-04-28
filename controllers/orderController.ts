import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import '../models/OrderItem';
import { monthNames, setEndDate, setStartDate } from "../utils/utils";
import Variant from "../models/Variant";
import OrderItem from "../models/OrderItem";
import mongoose from "mongoose";
import OrderService from "../services/OrderService";
import AuditLogService from "../services/AuditLogService";
import { AuthRequest } from "../types/auth";

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
        OrderService.sendOrderNotification({ order: order[0] });

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

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const order = await Order.findById(req.params.id)
        .populate({
            path: "order_items",
            populate: {
                path: 'variant',
                populate: 'product'
            }
        });

        if(!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({
            success: true,
            order
        })

    }catch(err){
        next(err);
    }
}

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

export const orderMarkAsPaid = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (!req.body.payment_method) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Payment method is required",
            });
        }

        if (!req.body.payment) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Payment is required",
            });
        }

        const order = await Order.findById(req.params.id)
            .populate({
                path: "order_items",
                populate: {
                    path: "variant",
                    populate: "product",
                },
            })
            .session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const oldOrder = order;

        if (order.payment_status === "paid") {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "This order is already paid",
            });
        }

        const payment = Number(req.body.payment);
        const change = payment - order.total_amount;

        if (payment < order.total_amount) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Payment is insufficient",
            });
        }

        order.payment = payment;
        order.change = change;
        order.payment_status = "paid";
        order.payment_method = req.body.payment_method;

        if (order.delivery_type === "pickup") {
            order.status = "completed";
        }

        // update stock if completed
        if (order.status === "completed") {
            await OrderService.decreaseStockForOrder(order.order_items, session);
        }
        await AuditLogService.log({
            action: "ORDER_PAID",
            description: `Order ${order.order_id} has been marked as paid.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: oldOrder,
            new_values: order,
        });

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Order successfully marked as paid",
            order,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const order = await Order.findById(req.params.id) 
            .populate({
                path: "order_items",
                populate: {
                    path: "variant",
                    populate: "product",
                },
            })
            .session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.payment_status !== "paid") {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Order should be paid first",
            });
        }

        const allowedTransitions: Record<string, string[]> = {
            pending: ["processing", "cancelled"],
            processing: ["delivered", "cancelled"],
            delivered: ["completed", "refunded", "failed"],
            completed: ["refunded"],
            cancelled: [],
            refunded: [],
            expired: [],
            failed: [],
        };

        const currentStatus = order.status;
        const newStatus = req.body.status;

        const allowedNextStatuses = allowedTransitions[currentStatus] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: `Cannot update order status from ${currentStatus} to ${newStatus}. Please reload the page`,
            });
        }

        order.status = newStatus;

        // stock deduction only when completed
        if (order.status === "completed") {
            await OrderService.decreaseStockForOrder(order.order_items, session);
        }

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        await AuditLogService.log({
            action: "ORDER_UPDATED",
            description: `Order ${order.order_id} has been updated from ${currentStatus} to ${newStatus}.`,
            ip_address: req.ip || "",
            role: req?.user?.role?.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user?._id,
            old_values: {
                status: currentStatus,
            },
            new_values: {
                status: newStatus,
            },
        });

        return res.status(200).json({
            success: true,
            message: `Order ${order.order_id} successfully marked as ${newStatus}`,
            order
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};

export const getOrderMonthlySales = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        
        const monthlySales = await OrderService.getMonthlyOrderSalesByYear(year);

        res.status(200).json({
            success: true,
            monthlySales
        })

    }catch(err){
        next(err);
    }
}

export const getOrderSalesToday = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const sales = await OrderService.getOrderSales({
            period: "today"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getOrderSalesThisWeek = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const sales = await OrderService.getOrderSales({
            period: "thisWeek"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getOrderSalesThisMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const sales = await OrderService.getOrderSales({
            period: "thisMonth"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getOrderSalesThisYear = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const sales = await OrderService.getOrderSales({
            period: "thisYear"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

