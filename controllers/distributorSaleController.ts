import { NextFunction, Request, Response } from "express";
import DistributorSale from "../models/DistributorSale";
import { setEndDate, setStartDate } from "../utils/utils";

export const getAllDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";

        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const filter: any = { };

        if(search){
            filter.$or = [
                { "variant.variant_name" : { $regex: search, $options: "i" } },
                { "variant.sku" : { $regex: search, $options: "i" } },
                { "seller.distributor_name" : { $regex: search, $options: "i" }},
                { "seller.email" : { $regex: search, $options: "i" } },
            ]
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const [distributorSales, total, totalSalesResult] = await Promise.all([
            DistributorSale.aggregate([
                {
                    $lookup: {
                        from: "variants",
                        localField: "variant_id",
                        foreignField: "_id",
                        as: "variant"
                    }
                },
                { $unwind: "$variant" },
                {
                    $lookup: {
                        from: 'distributors',
                        localField: "seller_id",
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: "$seller" },
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit }
            ]),
            DistributorSale.countDocuments(filter),
            DistributorSale.aggregate([
                { $match: filter },
                { $group: { _id: null, totalSales: { $sum: "$total_amount" } } }
            ])
        ]);

        const totalSales = totalSalesResult[0]?.totalSales || 0;

        res.status(200).json({
            distributorSales,
            totalSales,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            }
        });

    } catch (err) {
        next(err);
    }
}

export const getDistributorSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";

        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;

        const filter: any = { seller_id: req.params.id };

        if(search){
            filter.$or = [
                { "variant.variant_name" : { $regex: search, $options: "i" } },
                { "variant.sku" : { $regex: search, $options: "i" } }
            ]
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const [distributorSales, total, totalSalesResult] = await Promise.all([
            DistributorSale.aggregate([
                {
                    $lookup: {
                        from: "variants",
                        localField: "variant_id",
                        foreignField: "_id",
                        as: "variant"
                    }
                },
                { $unwind: "$variant" },
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit }
            ]),
            DistributorSale.countDocuments(filter),
            DistributorSale.aggregate([
                { $match: {
                    ...filter,
                    seller_id: req.params.id
                }},
                { $group: { _id: null, totalSales: { $sum: "$total_amount" } } }
            ])
        ]);

        const totalSales = totalSalesResult[0]?.totalSales || 0;

        res.status(200).json({
            distributorSales,
            totalSales,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            }
        });

    } catch (err) {
        next(err);
    }
}