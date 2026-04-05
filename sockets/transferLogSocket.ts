import type { Server as SocketIOServer, Namespace, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/User";
import Distributor from "../models/Distributor";
import StockTransfer, { StockTransferAttributes } from "../models/StockTransfer";
import DistributorNotification, { DistributorNotificationAttributes } from "../models/DistributorNotification";
dotenv.config();

export let stockTransferNamespace: Namespace;

export function initStockTransferLogSocket(io: SocketIOServer): void {
    stockTransferNamespace = io.of("/stock-transfer");

    stockTransferNamespace.on("connection", async (socket: Socket) => {
        try {
            const authHeader = socket.handshake.auth.token;
            if (!authHeader?.startsWith("Bearer ")) {
                throw(new Error("Access token required"))
            }
            
            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
            const userId = decoded.id || decoded._id;
            const user = await User.findOne({
                _id: userId,
                status: 'active'
            });

            const distributor = await Distributor.findOne({
                _id: userId,
                status: 'active'
            })

            if(!user && !distributor){
                throw new Error("Unauthorized user");
            }

            socket.join(userId);

            console.log("User connected", userId);

        } catch (err) {
            console.log("Error", err);
            socket.disconnect();
        }
    });
}

export async function emitStockTransfer(distributorNotification: DistributorNotificationAttributes, to : string) {
    if (stockTransferNamespace) {
        console.log("Stock successfully transfered", distributorNotification)
        stockTransferNamespace.to(to).emit("stockTransfer", distributorNotification);
    } else {
        console.warn("Stock transfer namespace not initialized yet.");
    }
}