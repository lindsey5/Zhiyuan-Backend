import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/auth";
import AuditLogService from "../services/AuditLogService";
import Role from "../models/Role";
import User from "../models/User";
import mongoose from "mongoose";

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userData = req.body;

        const role = await Role.findById(userData.role_id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role id not found or does not exist."
            });
        }

        const newUser = await User.create(userData);

        await AuditLogService.log({
            action: "CREATE_USER",
            description: `User successfully created with role_id ${userData.role_id}.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "CRITICAL",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            new_values: newUser,
            old_values: null
        });

        res.status(201).json({
            success: true,
            message: "User successfully created",
            user: newUser
        });

    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search ? String(req.query.search) : "";
        const role = req.query.role ? String(req.query.role) : "";

        const filter : any = { _id: { $ne: req.user._id } };

        if(search){
            filter.$or = [
                { firstname: { $regex: search, $options:  "i" }},
                { lastname: { $regex: search, $options:  "i" }},
                { email: { $regex: search, $options:  "i" }}
            ]
        }

        if (role) {
            const roleDoc = await Role.findOne({ name: role }).select("_id");
            if (roleDoc) filter.role_id = roleDoc._id;
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password")
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
                .populate({
                    path: "role",
                    populate: { path: "permissions" }
                })
                .exec()
        ])

       const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages,
            total,
            users,
        });

    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const oldValues = user.toObject();
        user.set(req.body);
        await user.save();

        const updatedUser = user.toObject();

        await AuditLogService.log({
            action: "UPDATE_USER",
            description: `User ID ${req.params.id} successfully updated.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "MEDIUM",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: updatedUser
        });

        res.status(200).json({
            success: true,
            message: "User successfully updated",
            updatedUser
        });

    } catch (err) {
        next(err);
    }
};

export const userGetOwn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate({
                path: "role",
                populate: { path: "permissions" }
            });

        res.status(200).json({ success: true, user });

    } catch (err) {
        next(err);
    }
};

export const userUpdateOwn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const existingEmail = await User.findOne({
            email: req.body.email,
            _id: { $ne: req.user._id }
        });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("role");

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found."
            });
        }

        user.set(req.body);
        await user.save();

        const updatedUser: any = user.toObject();
        const { role, ...rest } = updatedUser;

        res.status(200).json({ 
            success: true, 
            message: "Successfully Updated",
            user: {
                ...rest,
                role: role?.name
            }
        });

    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const oldValues = user.toObject();
        await User.deleteOne({ _id: req.params.id });

        await AuditLogService.log({
            action: "DELETE_USER",
            description: `User with ID ${req.params.id} successfully deleted.`,
            ip_address: req.ip || "",
            role: req.user.role.name || "N/A",
            severity: "CRITICAL",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: null
        });

        res.status(200).json({
            success: true,
            message: "User successfully deleted."
        });

    } catch (err) {
        next(err);
    }
};

export const getUsersCount = async (req : Request, res : Response, next: NextFunction) => {
    try{
        const usersCount = await Role.aggregate([
        {
            $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "role_id",
            as: "users",
            },
        },
        {
            $project: {
                _id: 0,
                role_name: '$name',
                total: { $size: "$users" }
            },
        },
        ]);
        res.status(200).json({
            success: true,
            usersCount
        })

    }catch(err) {
        next(err);
    }
}

export const isEmailExist = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const existingEmail = await User.findOne({
            email: req.query.email,
            _id: { $ne: new mongoose.Types.ObjectId(req.query.id as string) }
        })

        if(!existingEmail){
            return res.status(400).json({
                success: false,
                message: 'Email not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Email existed'
        })

    }catch(err){
        next(err);
    }
}