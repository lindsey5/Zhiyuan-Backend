import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initStockTransferLogSocket } from "./transferLogSocket";
dotenv.config();

export function registerSockets(io: Server) {
    initStockTransferLogSocket(io);
}

export default function initializeSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: ['*'],
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
        },
    });

    registerSockets(io);
}