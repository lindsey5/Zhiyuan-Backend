import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
import UserNotification from "../models/UserNotification";
import redisClient, { deleteCache } from "../config/redis";

export const getUserNotifications = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const cacheKey = `user-notifications:${req.user._id}:${page}:${limit}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const [userNotifications, total, unread] = await Promise.all([
            UserNotification.find({ user_id: req.user._id })
            .populate([
                {
                    path: "saleNotification",
                    populate: [
                        { 
                            path: "sales", 
                            populate: {
                                path: "variant",
                                populate: "product"
                            },
                        },
                        { 
                            path: "sold_by", 
                            select: "-password",
                            populate: 'parent_distributor'
                        }
                    ]
                },
                {
                    path: 'returnNotification',
                    populate: {
                        path: 'returnRequest',
                        populate: [
                            { path: 'items.variant', populate: 'product' },
                            { path: 'distributor', select: '-password' }
                        ]
                    }
                },
                {
                    path: 'orderNotification',
                    populate: {
                        path: 'order',
                        populate: {
                            path: 'order_items',
                            populate: {
                                path: 'variant',
                                populate: 'product'
                            }
                        }
                    }
                },
                {
                    path: 'stockTransferNotification',
                    populate: {
                        path: "stockTransfer",
                        populate: [
                            { path: "sender", select: "-password" },
                            { path: 'receiver', select: "-password" },
                            { 
                                path: "items",
                                populate: {
                                    path: "variant",
                                    populate: "product"
                                }
                            }
                        ]
                    }
                },
                {
                    path: 'stockOrderNotification',
                    populate: {
                        path: 'stockOrder',
                        populate: [
                            { path: 'distributor', select: '-password' },
                            { path: 'items.variant' }
                        ]
                    }
                },
                {
                    path: 'sponsoredItemNotification',
                    populate: {
                        path: 'sponsored_item',
                        populate: [
                            {
                                path: 'variant',
                                populate: 'product'
                            },
                            { path: 'distributor', select: '-password' }
                        ]
                    }
                },
                {
                    path: 'withdrawalNotification',
                    populate: {
                        path: 'withdrawalRequest',
                        populate: { path: 'distributor', select: '-password' }
                    }
                }
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            UserNotification.countDocuments({ user_id: req.user._id }),
            UserNotification.countDocuments({ user_id: req.user._id, status: 'unread' })
        ])

        const totalPages = Math.ceil(total / limit);

        const responseData = {
            page,
            limit,
            totalPages,
            total,
            unread,
            userNotifications
        }

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

export const readNotification = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const notification = await UserNotification.findById(req.params.id);

        if(!notification){
            return res.status(404).json({ success: false, message: "Notification not found"});
        }

        if(notification.user_id.toString() !== req.user._id.toString()){
            return res.status(401).json({ success: false, message: "Unauthorized access" })
        }

        notification.status = "read";

        await notification.save();

        await deleteCache(`user-notifications:${req.user._id}:*`);

        res.status(200).json({ success: true })
    }catch(err){
        next(err);
    }
}

export const readAllNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        await UserNotification.updateMany({ user_id: req.user._id}, { $set: { status: 'read' }});

        res.status(200).json({
            success: true,
            message: "All notifications successfully read",
        })

    }catch(err){
        next(err);
    }
}