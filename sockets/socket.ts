import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initStockTransferLogSocket } from "./stockTransferSocket";
import { initNotificationSocket } from "./notificationSocket";
dotenv.config();

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173', 'http://localhost:5174'];

export function registerSockets(io: Server) {
    initStockTransferLogSocket(io);
    initNotificationSocket(io);
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