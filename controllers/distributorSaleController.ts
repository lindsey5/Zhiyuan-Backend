import { NextFunction, Request, Response } from "express";
import DistributorSale from "../models/DistributorSale";
import { setEndDate, setStartDate } from "../utils/utils";
import mongoose from "mongoose";
import Distributor from "../models/Distributor";
import { success } from "zod";
import DistributorSaleService from "../services/DistributorSaleService";

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
                { "seller.distributor_name" : { $regex: search, $options: "i" } },
                { "seller.email" : { $regex: search, $options: "i" } },
                { "seller.distributor_id" : { $regex: search, $options: "i" } }
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

        const filter: any = { seller_id: new mongoose.Types.ObjectId(req.params.id as string) };

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

export const getDistributorSalesToday = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "today"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisMonth"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisWeek = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisWeek"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getDistributorSalesThisYear = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const sales = await DistributorSaleService.getDistributorSales({
            distributorId: distributor?.id,
            period: "thisYear"
        })

        res.status(200).json({ success: true, sales })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldToday = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'today'
        })
        
        res.status(200).json({ success: true, totalQuantity })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisWeek = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisWeek'
        })
        
        res.status(200).json({ success: true, totalQuantity })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisMonth'
        })
        
        res.status(200).json({ success: true, totalQuantity })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldThisYear = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const totalQuantity = await DistributorSaleService.getDistributorItemsSold({
            distributorId: distributor?.id,
            period: 'thisYear'
        })
        
        res.status(200).json({ success: true, totalQuantity })

    }catch(err){
        next(err);
    }
}

export const getDistributorMonthlySales = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const monthlySales = await DistributorSaleService.getMonthlySalesByYear(year, distributor?.id);

        res.status(200).json({
            success: true,
            monthlySales,
            year
        })

    }catch(err){
        next(err);
    }
}

export const getDistributorItemsSoldPerMonth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const distributor = await Distributor.findById(req.params.id);

        if(!distributor && req.params.id){
            return res.status(404).json({ success: false, message: 'Distributor not found.' });
        }

        const itemsSoldPerMonth = await DistributorSaleService.getItemsSoldPerMonthByYear(year, distributor?.id);

        res.status(200).json({
            success: true,
            itemsSoldPerMonth,
            year
        })

    }catch(err){
        next(err);
    }
}