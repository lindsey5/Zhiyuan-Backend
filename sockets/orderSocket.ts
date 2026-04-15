import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "./socketConnection";
dotenv.config();

export let orderNamespace: Namespace;

export function initOrderSocket(io: SocketIOServer): void {
    orderNamespace = io.of("/orders");

    socketConnection({
        namespace: orderNamespace, 
        message: "User connected to order namespace",
        authenticate: false 
    })
}