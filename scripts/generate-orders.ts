import readline from "readline";
import mongoose from "mongoose";
import Variant from "../models/Variant";
import dotenv from "dotenv";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import dns from "node:dns/promises";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

async function getRandomVariant() {
    const variants = await Variant.aggregate([
        { $match: { status: "active" } },
        { $sample: { size: 1 } },
    ]);
    return variants[0];
}

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Database connected.");

        const input = await question("How many orders to generate? ");

        const count = parseInt(input);

        if (isNaN(count) || count <= 0) {
            console.log("Invalid number.");
            return;
        }

        for (let i = 1; i <= count; i++) {
        const order = new Order({
            order_id: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customer_name: `Customer ${i}`,
            status: "pending",
            total_amount: 0,
            delivery_type: ["pickup", "delivery"][Math.floor(Math.random() * 2)],
            payment_method: ["COD", "GCash", "Card"][Math.floor(Math.random() * 3)],
            payment_status: "unpaid"
        });

        await order.save();

        const numItems = Math.floor(Math.random() * 5) + 1;
        let orderTotal = 0;

        for (let j = 1; j <= numItems; j++) {
            const variant = await getRandomVariant();
            if (!variant) continue;

            const price = variant.price;
            const quantity = Math.floor(Math.random() * 3) + 1;
            const amount = price * quantity;

            const orderItem = new OrderItem({
                order_id: order._id,
                variant_id: variant._id,
                price,
                quantity,
                amount,
            });

            await orderItem.save();
            orderTotal += amount;
        }

            order.total_amount = orderTotal;
            await order.save();
        }

        console.log(`Generated ${count} orders successfully.`);
    } catch (err) {
        console.error("Error generating demo orders:", err);
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
})();