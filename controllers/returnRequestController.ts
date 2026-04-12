import { NextFunction, Request, Response } from "express";
import ReturnRequest from "../models/ReturnRequest";
import DistributorStock from "../models/DistributorStock";
import Distributor from "../models/Distributor";
import { emitDistributorNotification } from "../sockets/distributorNotificationSocket";
import DistributorNotification from "../models/DistributorNotification";
import mongoose from "mongoose";

export const getReturnRequests = async (req: Request, res: Response, next: NextFunction) => {
    try{



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
            .populate('variant')
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