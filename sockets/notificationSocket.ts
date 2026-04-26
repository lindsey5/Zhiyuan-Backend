import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "./socketConnection";
import NotificationService from "../services/NotificationService";
dotenv.config();

export let notificationNamespace: Namespace;

export function initNotificationSocket(io: SocketIOServer): void {
    notificationNamespace = io.of("/notification");

    const notification = new NotificationService(notificationNamespace);

    const events = {
        "send-sale-notification": notification.sendSaleNotification,
        "send-return-notification" : notification.sendReturnNotification,
        "send-cancel-return-notification": notification.sendCancelReturnNotification,
        "send-stock-transfer-notification" : notification.sendStockTransferNotification,
        "send-stock-order-notification" : notification.sendStockOrderNotification,
        "send-cancel-stock-order": notification.sendStockOrderCancel,
        "send-sponsored-item-notification" : notification.sendSponsoredItemNotification,
    }

    socketConnection({
        namespace: notificationNamespace, 
        message: "User connected to notification namespace", 
        events
    })
}