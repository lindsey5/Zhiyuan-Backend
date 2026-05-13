import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "../socketConnection";
import NotificationService from "../../services/NotificationService";
import notificationEvents from "../events/notification.events";
dotenv.config();

export let notificationNamespace: Namespace;

export function initNotificationNamespace(io: SocketIOServer): void {
    notificationNamespace = io.of("/notification");

    socketConnection({
        namespace: notificationNamespace, 
        message: "User connected to notification namespace", 
        events: notificationEvents(new NotificationService(notificationNamespace))
    })
}