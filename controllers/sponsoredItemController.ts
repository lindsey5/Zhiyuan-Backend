import { NextFunction, Request } from "express";
import { Response } from "express";
import SponsoredItem from "../models/SponsoredItem";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient from "../config/redis";

export const getSponsoredItems = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;
        const search = req.query.search?.toString() || "";
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const status = req.query.status ? String(req.query.status) : null;

        const filter: any = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const cacheKey = `sponsored-items:${search}:${page}:${limit}:${sortBy}:${order}:${startDate}:${endDate}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        if(search){
            filter.$or = [
                { "distributor.distributor_name" : { $regex: search, $options: "i" } },
                { "distributor.distributor_id" : { $regex: search, $options: "i" } },
                { "distributor.email" : { $regex: search, $options: "i" } },
                { "variant.product.product_name" : { $regex: search, $options: "i" } },
                { "variant.variant_name" : { $regex: search, $options: "i" } },
                { "variant.sku" : { $regex: search, $options: "i" } },
            ]
        }

        if(status){
            filter.status = status;
        }

        const [sponsoredItems, total] = await Promise.all([
            SponsoredItem.aggregate([
                {
                    $lookup: {
                        from: "distributors",
                        localField: "distributor_id",
                        foreignField: "_id",
                        as: "distributor"
                    }
                },
                { $unwind: "$distributor" },
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
                        from: "products",
                        localField: "variant.product_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $addFields: {
                        "variant.product": "$product"
                    }
                },
                {
                    $project: {
                        product: 0
                    }
                },
                { $match: filter },
                { $sort: { [sortBy]: order } },
                { $skip: skip },
                { $limit: limit }
            ]),
            SponsoredItem.countDocuments(filter),
        ])

        const responseData = {
            sponsoredItems,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        })

        res.status(200).json({
            success: true,
            ...responseData
        })
    }catch(err){
        next(err);
    }
}