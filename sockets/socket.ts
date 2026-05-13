import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initNotificationNamespace } from "./namespaces/notification.namespace";
import { initDistributorNotificationNamespace } from "./namespaces/distributorNotification.namespace";
import { initOrderNamespace } from "./namespaces/order.namespace";
dotenv.config();

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173', 'http://localhost:5174'];

export function registerSockets(io: Server) {
    initDistributorNotificationNamespace(io);
    initNotificationNamespace(io);
    initOrderNamespace(io);
}

export default function initializeSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: origins,
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
            credentials: true,
        },
    });

    registerSockets(io);
}