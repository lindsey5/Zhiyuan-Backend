import mongoose from "mongoose";
import OrderNotification from "../models/OrderNotification";
import User from "../models/User";
import UserNotification from "../models/UserNotification";
import Variant from "../models/Variant";
import { emitOrderNotification } from "../sockets/orderSocket";
import { OrderAttributes, OrderItemAttributes } from "../types/model-attributes";
import PERMISSIONS from "../utils/permissions";

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
                    message: `New order created: ${order.order_id}`,
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
}

export default OrderService