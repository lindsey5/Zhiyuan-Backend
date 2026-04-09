
import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "./socketConnection";
import { DistributorSaleAttributes } from "../models/DistributorSale";
import User from "../models/User";
import PERMISSIONS from "../utils/permissions";
import UserNotification from "../models/UserNotification";
import SaleNotification from "../models/SaleNotification";
dotenv.config();

export let notificationNamespace: Namespace;

export function initNotificationSocket(io: SocketIOServer): void {
    notificationNamespace = io.of("/notification");

    const events = {
        "send-sale-notification": async (payload : { distributor_id: string, distributor_name: string, sales: DistributorSaleAttributes[]}) => {
            try{
                const { distributor_id, distributor_name, sales } = payload;

                const users = await User.find({ status: 'active' })
                    .populate({
                        path: "role",
                        populate: { path: "permissions" }
                    });

                const authorizedUsers = users.filter(user =>
                    user.role?.permissions?.some(p => p.action === PERMISSIONS.DISTRIBUTOR_SALES_NOTIFICATION)
                );

                for(const user of authorizedUsers){
                    const userNotification = await UserNotification.create({
                        user_id: user._id,
                        message: `${distributor_name} sold ${sales.reduce((total, sale) => total + sale.quantity, 0)} items`
                    })

                    const saleNotification = await SaleNotification.create({
                        notification_id: userNotification._id,
                        distributor_id,
                        sale_ids: sales.map(sale => sale._id)
                    })

                    await saleNotification.populate([
                        { path: "sales", populate: "variant" },
                        { path: "sold_by", select: "-password" }
                    ])

                    notificationNamespace.to(user.id).emit("receive-notification", { 
                        userNotification: {
                            ...userNotification.toObject(),
                            saleNotification
                        }
                    })
                }

            }catch(err){
                console.log(err);
            }
        }
    }

    socketConnection(
        notificationNamespace, 
        "User connected to notification namespace", 
        events
    )
}