import mongoose from "mongoose";
import OrderNotification from "../models/OrderNotification";
import User from "../models/User";
import UserNotification from "../models/UserNotification";
import Variant from "../models/Variant";
import { emitOrderNotification } from "../sockets/namespaces/order.namespace";
import { OrderAttributes, OrderItemAttributes } from "../types/model-attributes";
import PERMISSIONS from "../utils/permissions";
import Order from "../models/Order";
import { monthNames } from "../utils/utils";

class OrderService {
    static async sendOrderNotification ({ order } : { order: OrderAttributes}) {
        const users = await User.find({ status: "active" })
            .populate({
                path: "role",
                populate: { path: "permissions" },
            })

        const authorizedUsers = users.filter((user) =>
            user.role?.permissions?.some(
                (p) =>
                    p.action === PERMISSIONS.ORDER_READ_ALL ||
                    p.action === PERMISSIONS.ORDER_UPDATE
            )
        );

        for (const user of authorizedUsers) {
            const userNotification = await UserNotification.create(
                {
                    user_id: user._id,
                    message: `New walk-in order has been placed. Order ID: ${order.order_id}`
                },
            );

            const orderNotification = await OrderNotification.create(
                {
                    order_id: order._id,
                    notification_id: userNotification._id,
                },
            );

            await orderNotification.populate({
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
                userNotification,
                orderNotification,
                user.id
            );
        }
    }

    static async decreaseStockForOrder(order_items : OrderItemAttributes[], session: mongoose.ClientSession){
        for (const order_item of order_items) {
            const variant = await Variant.findById(order_item.variant_id).session(session);

            if (!variant) continue;

            if (variant.stock < order_item.quantity) {
                throw new Error(`Not enough stock for ${variant.variant_name}`)
            }

            variant.stock -= order_item.quantity;
            await variant.save({ session });
        }
    }

    static async getMonthlyOrderSalesByYear(year: number) {
        const match: any = {
            status: "completed",
            createdAt: {
                $gte: new Date(year, 0, 1, 0, 0, 0, 0),
                $lte: new Date(year, 11, 31, 23, 59, 59, 999),
            },
        };

        const result = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalSales: { $sum: "$total_amount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    totalSales: 1,
                },
            },
            { $sort: { month: 1 } },
        ]);

        // Default Jan-Dec with 0
        const monthlySales = monthNames.map((name) => ({
            month: name,
            totalSales: 0,
        }));

        // Fill actual values
        result.forEach((item) => {
            monthlySales[item.month - 1].totalSales = item.totalSales;
        });

        return monthlySales;
    }

    static async getOrderSales ({ period } : { period: Period}) {
        const now = new Date();
        const match: any = { status: "completed" };

        // Filter by period
        switch (period) {
            case "today":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
                };
                break;

            case "thisWeek":
                // Assuming week starts on Sunday
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - now.getDay());
                firstDayOfWeek.setHours(0, 0, 0, 0);

                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                lastDayOfWeek.setHours(23, 59, 59, 999);

                match.createdAt = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };
                break;

            case "thisMonth":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                };
                break;

            case "thisYear":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),   // Jan 1, 00:00
                    $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) // Dec 31, 23:59
                };
                break;

            case "all":
            default:
                // no createdAt filter
                break;
        }

        const result = await Order.aggregate([
            { $match: match },
            { $group: { _id: null, totalSales: { $sum: "$total_amount" } } }
        ]);

        return result[0]?.totalSales || 0;
    }
}

export default OrderService