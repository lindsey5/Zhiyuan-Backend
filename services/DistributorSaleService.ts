import mongoose from "mongoose";
import DistributorSale from "../models/DistributorSale";
import { monthNames } from "../utils/utils";

class DistributorSaleService {
    static async getDistributorSales ({ distributorId, period } : { distributorId?: string, period: Period}) {
        const now = new Date();
        const match: any = {};

        // Filter by distributor if provided
        if (distributorId) match.seller_id = new mongoose.Types.ObjectId(distributorId);

        // Filter by period
        switch (period) {
            case "today":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
                };
                break;

            case "thisWeek":
                // Assuming week starts on Sunday
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - now.getDay());
                firstDayOfWeek.setHours(0, 0, 0, 0);

                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                lastDayOfWeek.setHours(23, 59, 59, 999);

                match.createdAt = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };
                break;

            case "thisMonth":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                };
                break;

            case "thisYear":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),   // Jan 1, 00:00
                    $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) // Dec 31, 23:59
                };
                break;

            case "all":
            default:
                // no createdAt filter
                break;
        }

        const result = await DistributorSale.aggregate([
            { $match: match },
            { $group: { _id: null, totalSales: { $sum: "$total_amount" } } }
        ]);

        return result[0]?.totalSales || 0;
    }

    static async getDistributorItemsSold ({ distributorId, period } : { distributorId?: string, period: Period}) {
        const now = new Date();
        const match: any = {};

        // Filter by distributor if provided
        if (distributorId) match.seller_id = new mongoose.Types.ObjectId(distributorId);

        // Filter by period
        switch (period) {
            case "today":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
                };
                break;

            case "thisWeek":
                // Assuming week starts on Sunday
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - now.getDay());
                firstDayOfWeek.setHours(0, 0, 0, 0);

                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                lastDayOfWeek.setHours(23, 59, 59, 999);

                match.createdAt = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };
                break;

            case "thisMonth":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
                    $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                };
                break;

            case "thisYear":
                match.createdAt = {
                    $gte: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),   // Jan 1, 00:00
                    $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) // Dec 31, 23:59
                };
                break;

            case "all":
            default:
                // no createdAt filter
                break;
        }

        const result = await DistributorSale.aggregate([
            { $match: match },
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
        ]);

        return result[0]?.totalQuantity || 0;
    }

    static async getMonthlySalesByYear(year: number, distributorId?: string) {
        const match: any = {
            createdAt: {
            $gte: new Date(year, 0, 1, 0, 0, 0, 0),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999),
            },
        };

        if (distributorId) {
            match.seller_id = new mongoose.Types.ObjectId(distributorId);
        }

        const result = await DistributorSale.aggregate([
            { $match: match },
            {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalSales: { $sum: "$total_amount" },
            },
            },
            {
            $project: {
                _id: 0,
                month: "$_id.month",
                totalSales: 1,
            },
            },
            { $sort: { month: 1 } },
        ]);


        // Default Jan-Dec with 0
        const monthlySales = monthNames.map((name) => ({
            month: name,
            totalSales: 0,
        }));

        // Fill actual values
        result.forEach((item) => {
            monthlySales[item.month - 1].totalSales = item.totalSales;
        });

        return monthlySales;
    }

    static async getItemsSoldPerMonthByYear(year: number, distributorId?: string) {
        const match: any = {
            createdAt: {
            $gte: new Date(year, 0, 1, 0, 0, 0, 0),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999),
            },
        };

        if (distributorId) {
            match.seller_id = new mongoose.Types.ObjectId(distributorId);
        }

        const result = await DistributorSale.aggregate([
            { $match: match },
            {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalQuantity: { $sum: "$quantity" },
            },
            },
            {
            $project: {
                _id: 0,
                month: "$_id.month",
                totalQuantity: 1,
            },
            },
            { $sort: { month: 1 } },
        ]);

        // Default Jan-Dec with 0
        const itemsSoldPerMonth = monthNames.map((name) => ({
            month: name,
            totalQuantity: 0,
        }));

        // Fill actual values
        result.forEach((item) => {
            itemsSoldPerMonth[item.month - 1].totalQuantity = item.totalQuantity;
        });

        return itemsSoldPerMonth;
    }

}

export default DistributorSaleService