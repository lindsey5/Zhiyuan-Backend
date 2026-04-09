
import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "./socketConnection";
dotenv.config();

export let notificationNamespace: Namespace;

export function initStockTransferLogSocket(io: SocketIOServer): void {
    socketConnection(
        "/notification", 
        io,
        notificationNamespace, 
        "User connected to notification namespace"
    )
}
