import mongoose from "mongoose";
import StockTransfer from "../models/StockTransfer";
import StockTransferItem from "../models/StockTransfer";

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

            return true
        } catch (err) {
            console.log(err);

            return false
        }
    }
}