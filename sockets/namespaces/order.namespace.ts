import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "../socketConnection";
import { OrderNotificationAttributes } from "../../models/OrderNotification";
import { UserNotificationAttributes } from "../../models/UserNotification";
dotenv.config();

export let orderNamespace: Namespace;

export function initOrderNamespace(io: SocketIOServer): void {
    orderNamespace = io.of("/orders");

    socketConnection({
        namespace: orderNamespace, 
        message: "User connected to order namespace",
        authenticate: false 
    })
}

export async function emitOrderNotification(userNotification: UserNotificationAttributes, orderNotification: OrderNotificationAttributes, to : string) {
    if (!orderNamespace) {
        console.warn("Order Notification namespace not initialized yet.");
        return;
    }

    orderNamespace.to(to).emit("receive-notification", {
        userNotification: {
            ... userNotification.toObject(),
            orderNotification: orderNotification.toObject()
        }
    });
}