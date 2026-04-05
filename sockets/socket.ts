import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initStockTransferLogSocket } from "./transferLogSocket";
dotenv.config();

const allowedOrigins = (process.env.ORIGINS?.split(",") || [
    "https://zhiyuan-frontend.vercel.app",
    "https://zhiyuan-distributor.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
]);

export function registerSockets(io: Server) {
    initStockTransferLogSocket(io);
}

export default function initializeSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins, 
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
            credentials: true,
        },
    });

    registerSockets(io);
}