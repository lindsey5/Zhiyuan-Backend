import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import '../models/OrderItem';
import { setEndDate, setStartDate } from "../utils/utils";

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
            .populate("order_items") 
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