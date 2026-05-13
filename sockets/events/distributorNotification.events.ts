import { Namespace } from "socket.io";
import DistributorNotificationService from "../../services/DistributorNotificationService";

export default function distributorNotificationEvents (namespace : Namespace) {
    const notification = new DistributorNotificationService(namespace);

    return {
        "parent-distributor-sale-notification": notification.sendParentDistributorSaleNotification,
    }
}