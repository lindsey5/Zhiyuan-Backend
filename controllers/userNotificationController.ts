import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
import UserNotification from "../models/UserNotification";

export const getUserNotifications = async (req : AuthRequest, res : Response, next : NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const [userNotifications, total, unread] = await Promise.all([
            UserNotification.find({ user_id: req.user._id })
            .populate([
                {
                    path: "saleNotification",
                    populate: [
                        { path: "sales", populate: "variant" },
                        { path: "sold_by", select: "-password" }
                    ]
                }
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            UserNotification.countDocuments({ user_id: req.user._id }),
            UserNotification.countDocuments({ user_id: req.user._id, status: 'unread' })
        ])

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            unread,
            userNotifications
        });

    }catch(err){
        next(err);
    }
}