import { NextFunction, Request, Response } from "express";
import ReturnRequest from "../models/ReturnRequest";
import DistributorStock from "../models/DistributorStock";
import Distributor from "../models/Distributor";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import DistributorNotification from "../models/DistributorNotification";
import mongoose from "mongoose";
import { setEndDate, setStartDate } from "../utils/utils";
import redisClient, { deleteCache } from "../config/redis";

export const getReturnRequests = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const startDate = req.query.startDate ? setStartDate(req.query.startDate as string) : null;
        const endDate = req.query.endDate ? setEndDate(req.query.endDate as string) : null;
        const order = req.query.order && String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

        const cacheKey = `returnRequests:${page}:${limit}:${search}:${startDate}:${endDate}:${order}`;
        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

        const matchStage: any = {};

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = startDate;
            if (endDate) matchStage.createdAt.$lte = endDate;
        }

        const pipeline: any[] = [
        { $match: matchStage },

        {
            $lookup: {
            from: "distributors",
            localField: "distributor_id",
            foreignField: "_id",
            as: "distributor"
            }
        },
        { $unwind: "$distributor" },

        // unwind items so we can lookup per item
        { $unwind: "$items" },

        {
            $lookup: {
            from: "variants",
            localField: "items.variant_id",
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

        // attach variant + product into items
        {
            $addFields: {
                "items.variant": {
                $mergeObjects: [
                    "$variant",
                    { product: "$product" }
                ]
                }
            }
        },

        // group back items into array
        {
            $group: {
                _id: "$_id",
                distributor_id: { $first: "$distributor_id" },
                reason: { $first: "$reason" },
                distributor: { $first: "$distributor" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                items: { $push: "$items" }
            }
        }
        ];

        if (search) {
            pipeline.push({
                $match: {
                $or: [
                    { "distributor.distributor_name": { $regex: search, $options: "i" } },
                    { "distributor.distributor_id": { $regex: search, $options: "i" } },
                    { "distributor.email": { $regex: search, $options: "i" } }
                ]
                }
            });
        }

        const [returnRequests, countResult] = await Promise.all([
            ReturnRequest.aggregate([
                ...pipeline,
                { $sort: { createdAt: order } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                    "distributor.password": 0
                    }
                }
            ]),
            ReturnRequest.aggregate([...pipeline, { $count: 'total' }])
        ])

        const total = countResult[0]?.total || 0;
        const responseData = {
            returnRequests,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
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

export const updateReturnRequestItem = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    
    try{
        session.startTransaction();

        const returnId = req.params.return_id;
        const distributorId = req.params.distributor_id;
        const variantId = req.params.variant_id;
        const { status } = req.body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid Status' });
        }

        const distributor = await Distributor.findById(distributorId)

        if (!distributor) {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }

        const returnRequest = await ReturnRequest.findById(returnId).session(session);

        if (!returnRequest) {
            return res.status(404).json({ success: false, message: 'Return Request not found' });
        }

        if (returnRequest.distributor_id.toString() !== distributor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Return request does not belong to this distributor'
            });
        }

        const item = returnRequest.items.find(item => item.variant_id.toString() === variantId);

        if(!item){
            return res.status(404).json({ success: false, message: "Variant not found in request" });
        }

        const distributor_stock = await DistributorStock.findOne({
            distributor_id: distributorId,
            variant_id: item.variant_id
        }).populate({
            path: 'variant',
            populate: 'product'
        }).session(session);

        let finalStatus = status;

        if (status === 'pending' && (!distributor_stock || distributor_stock.quantity < item.quantity)) {
            finalStatus = 'insufficient stock';
        }

        if(item.status === 'pending'){
            item.status = finalStatus;
        }

        await returnRequest.save({ session });

        const distributorNotification = await DistributorNotification.create(
            [{
                distributor_id: distributor._id,
                return_id: returnId,
                message: `Your return request for ${distributor_stock?.variant.product?.product_name}-${distributor_stock?.variant.variant_name} has been ${status}`
            }],
            { session }
        );

        const notification = await distributorNotification[0].populate({
            path: 'returnRequest',
            populate: {
                path: 'items.variant',
                populate: 'product'
            }
        });

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(notification, distributor.id);

        await deleteCache('returnRequests:*')

        res.status(200).json({
            success: true,
            message: `${distributor_stock?.variant.product?.product_name}-${distributor_stock?.variant.variant_name} successfully ${status}`,
            returnRequest
        });

    }catch(err){
        next(err);
    }
}

export const updateAllReturnRequestItems = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const returnId = req.params.return_id;
        const distributorId = req.params.distributor_id;
        const { status } = req.body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid Status' });
        }

        const distributor = await Distributor.findById(distributorId).session(session);

        if (!distributor) {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }

        const returnRequest = await ReturnRequest.findById(returnId).session(session);

        if (!returnRequest) {
            return res.status(404).json({ success: false, message: 'Return Request not found' });
        }

        if (returnRequest.distributor_id.toString() !== distributor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Return request does not belong to this distributor'
            });
        }

        for (const item of returnRequest.items) {
            const distributor_stock = await DistributorStock.findOne({
                distributor_id: distributorId,
                variant_id: item.variant_id
            })
            .session(session);

            let finalStatus = status;

            if (status === 'pending' && (!distributor_stock || distributor_stock.quantity < item.quantity)) {
                finalStatus = 'insufficient stock';
            }

            if (distributor_stock && status === 'accepted' && distributor_stock.quantity >= item.quantity) {
                distributor_stock.quantity -= item.quantity;
                await distributor_stock.save({ session });
            }

            if(item.status === 'pending'){
                item.status = finalStatus;
            }
        }

        await returnRequest.save({ session });

        const distributorNotification = await DistributorNotification.create(
            [{
                distributor_id: distributor._id,
                return_id: returnId,
                message: `Your return request has been ${status}`,
            }],
            { session }
        );

        const notification = await distributorNotification[0].populate({
            path: 'returnRequest',
            populate: {
                path: 'items.variant',
                populate: 'product'
            }
        });

        await session.commitTransaction();
        session.endSession();

        await emitDistributorNotification(notification, distributor.id);

        await deleteCache('returnRequests:*')

        res.status(200).json({
            success: true,
            message: `Requests successfully ${status}`,
            returnRequest
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};