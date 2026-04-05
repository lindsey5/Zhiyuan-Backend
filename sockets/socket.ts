import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initStockTransferLogSocket } from "./transferLogSocket";
dotenv.config();

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173'];

export function registerSockets(io: Server) {
    initStockTransferLogSocket(io);
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