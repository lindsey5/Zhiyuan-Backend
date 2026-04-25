import { NextFunction, Request, Response } from "express";
import Review from "../models/Review";
import redisClient from "../config/redis";

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            review,
            message: "Review successfully submitted"
        })

    }catch(err){
        next(err);
    }
}

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const rating = req.query.rating ? Number(req.query.rating) : null;

        const cacheKey = `products:${page}:${limit}:${rating}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const filter : any = { };

        if(rating){
            filter.rating = rating;
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
            Review.countDocuments(filter)
        ])
        
        const totalPages = Math.ceil(total / limit);

        const responseData = {
            page,
            limit,
            totalPages,
            total,
            reviews,
        };

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        });

        res.status(200).json({
            success: true,
            ...responseData
        });

    }catch(err){
        next(err);
    }
}