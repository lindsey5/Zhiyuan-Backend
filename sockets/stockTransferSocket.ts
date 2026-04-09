import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import { DistributorNotificationAttributes } from "../models/DistributorNotification";
import socketConnection from "./socketConnection";
dotenv.config();

export let stockTransferNamespace: Namespace;

export function initStockTransferLogSocket(io: SocketIOServer): void {
    stockTransferNamespace = io.of("/stock-transfer");
    socketConnection(
        stockTransferNamespace, 
        "User connected to stock transfer namespace"
    )
}

export async function emitStockTransfer(distributorNotification: DistributorNotificationAttributes, to : string) {
    if (!stockTransferNamespace) {
        console.warn("Stock transfer namespace not initialized yet.");
        return;
    }
    stockTransferNamespace.to(to).emit("stockTransfer", distributorNotification);
}