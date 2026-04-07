import mongoose from "mongoose";
import StockTransfer from "../models/StockTransfer";
import StockTransferItem from "../models/StockTransferItem";
import { emitStockTransfer } from "../sockets/transferLogSocket";
import DistributorNotification from "../models/DistributorNotification";

export default class StockTransferService {
    static async logStockTransfer({
        sender_id,
        receiver_id,
        stocks,
        session
    }: {
        sender_id: string;
        receiver_id: string;
        stocks: { variant_id: string; quantity: number }[];
        session: mongoose.ClientSession;
    }) {
        try {
            const stockTransfer = await StockTransfer.create(
                [{ sender_id, receiver_id }],
                { session }
            );

            const items = stocks.map((stock) => ({
                ...stock,
                transfer_id: stockTransfer[0]._id,
            }));


            await StockTransferItem.insertMany(items, {
                ordered: false,
                session,
            });

            await stockTransfer[0].populate("sender");
            const sender = `${stockTransfer[0].sender.firstname} ${stockTransfer[0].sender.lastname}`;

            const totalStocks = items.reduce((acc, item) => item.quantity + acc, 0);

            const distributorNotification = await DistributorNotification.create(
                [{ 
                    distributor_id: receiver_id, 
                    transfer_id: stockTransfer[0]._id,
                    message: `You receive ${totalStocks} ${totalStocks === 1 ? 'stock' : 'stocks'} from ${sender}`
                }],
                { session }
            )

            const notification = await distributorNotification[0].populate({
                path: 'stockTransfer',
                populate: {
                    path: 'items',
                    populate: 'variant'
                }
            })

            await emitStockTransfer(notification, receiver_id)

            return true
        } catch (err) {
            console.log(err);

            return false
        }
    }
}