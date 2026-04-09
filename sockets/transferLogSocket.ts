import type { Server as SocketIOServer, Namespace, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/User";
import Distributor from "../models/Distributor";
import { DistributorNotificationAttributes } from "../models/DistributorNotification";
import socketConnection from "./socketConnection";
dotenv.config();

export let stockTransferNamespace: Namespace;

export function initStockTransferLogSocket(io: SocketIOServer): void {
    socketConnection(
        "/stock-transfer", 
        io,
        stockTransferNamespace, 
        "User connected to stock transfer namespace"
    )
}

export async function emitStockTransfer(distributorNotification: DistributorNotificationAttributes, to : string) {
    if (stockTransferNamespace) {
        console.log("Stock successfully transfered", distributorNotification)
        stockTransferNamespace.to(to).emit("stockTransfer", distributorNotification);
    } else {
        console.warn("Stock transfer namespace not initialized yet.");
    }
}