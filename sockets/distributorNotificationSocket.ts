import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import { DistributorNotificationAttributes } from "../models/DistributorNotification";
import socketConnection from "./socketConnection";
dotenv.config();

export let distributorNotificationNamespace: Namespace;

export function initDistributorNotificationSocket(io: SocketIOServer): void {
    distributorNotificationNamespace = io.of("/distributor-notification");
    socketConnection({
        namespace: distributorNotificationNamespace, 
        message: "User connected to Distributor Notification namespace"
    })
}

export async function emitDistributorNotification(distributorNotification: DistributorNotificationAttributes, to : string) {
    if (!distributorNotificationNamespace) {
        console.warn("Distributor Notification namespace not initialized yet.");
        return;
    }
    console.log('Distributor notification sent.');
    distributorNotificationNamespace.to(to).emit("receive-notification", distributorNotification);
}