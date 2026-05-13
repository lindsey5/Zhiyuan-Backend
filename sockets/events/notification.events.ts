import NotificationService from "../../services/NotificationService";

export default function notificationEvents (notification : NotificationService) {
    return {
        "send-sale-notification": notification.sendSaleNotification,
        "send-return-notification" : notification.sendReturnNotification,
        "send-cancel-return-notification": notification.sendCancelReturnNotification,
        "send-stock-transfer-notification" : notification.sendStockTransferNotification,
        "send-stock-order-notification" : notification.sendStockOrderNotification,
        "send-stock-order-update": notification.sendStockOrderUpdate,
        "send-sponsored-item-notification" : notification.sendSponsoredItemNotification,
        "send-sponsored-item-update" : notification.sendSponsoredItemUpdateNotification,
        "send-withdrawal-notification" : notification.sendWithdrawalNotification,
        "send-withdrawal-update" : notification.sendWithdrawalUpdateNotification,
    }
}