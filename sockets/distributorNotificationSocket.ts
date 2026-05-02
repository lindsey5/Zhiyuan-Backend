import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import DistributorNotification, { DistributorNotificationAttributes } from "../models/DistributorNotification";
import socketConnection from "./socketConnection";
import { DistributorSaleAttributes } from "../models/DistributorSale";
import Distributor from "../models/Distributor";
dotenv.config();

export let distributorNotificationNamespace: Namespace;

export function initDistributorNotificationSocket(io: SocketIOServer): void {
    distributorNotificationNamespace = io.of("/distributor-notification");
    socketConnection({
        namespace: distributorNotificationNamespace, 
        message: "User connected to Distributor Notification namespace",
        events: {
            "parent-distributor-sale-notification" : async ({ distributor_id, sales } : { distributor_id : string, sales: DistributorSaleAttributes[] }) => {
                const distributor = await Distributor.findById(distributor_id);

                if(distributor && distributor.parent_distributor_id){
                    const parentDistributor = await Distributor.findById(distributor.parent_distributor_id);

                    if(!parentDistributor) return;

                    const distributorNotification = await DistributorNotification.create({
                        distributor_id: distributor.parent_distributor_id,
                        sale_ids: sales.map(sale => sale.id),
                        message: `You receive ${parentDistributor.child_commission_rate}% commission from ${distributor.distributor_name} sales`
                    });

                    distributorNotification.populate({
                        path: "sales",
                        populate: [
                            { path: 'seller' },
                            {
                                path: 'variant',
                                populate: 'product'
                            }
                        ]
                    })

                    emitDistributorNotification(distributorNotification, distributor.parent_distributor_id.toString());
                }
            }
        }
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