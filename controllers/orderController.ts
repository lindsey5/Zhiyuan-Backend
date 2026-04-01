import { Request, Response, NextFunction } from "express";
import Order from "../database/models/Order";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const skip = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search) : "";
        const status = req.query.status ? String(req.query.status) : "";
        const paymentMethod = req.query.paymentMethod ? String(req.query.paymentMethod) : "";
        const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus) : "";

        const filter: any = {};

        if (search) {
            filter.$or = [
                { customer_name: { $regex: search, $options: "i" } },
                { order_id: { $regex: search, $options: "i" } },
            ];
        }

        if (status) filter.status = status;
        if (paymentMethod) filter.payment_method = paymentMethod;
        if (paymentStatus) filter.payment_status = paymentStatus;

        const total = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .populate("order_items") 
            .sort({ order_date: -1 })
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