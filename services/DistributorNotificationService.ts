import { Namespace } from "socket.io";
import Distributor from "../models/Distributor";
import { DistributorSaleAttributes } from "../models/DistributorSale";
import DistributorNotification from "../models/DistributorNotification";
import { emitDistributorNotification } from "../sockets/namespaces/distributorNotification.namespace";

export default class DistributorNotificationService {
    namespace: Namespace;

    constructor(namespace : Namespace) {
        this.namespace = namespace;

        this.sendParentDistributorSaleNotification = this.sendParentDistributorSaleNotification.bind(this);
    }

    async sendParentDistributorSaleNotification ({ distributor_id, sales } : { distributor_id : string, sales: DistributorSaleAttributes[] }) {
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