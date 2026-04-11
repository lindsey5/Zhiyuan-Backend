import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/auth";
import AuditLogService from "../services/AuditLogService";
import Role from "../models/Role";
import User from "../models/User";
import mongoose from "mongoose";
import validator from "validator";

import redisClient, { deleteCache } from "../config/redis";

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
            description: `User successfully created.`,
            ip_address: req.ip || "N/A",
            role: req.user.role.name || "N/A",
            severity: "CRITICAL",
            user_agent: req?.headers["user-agent"] || "N/A",
            user_id: req.user._id,
            new_values: newUser,
            old_values: null
        });

        await deleteCache("users:*")

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

        const cacheKey = `users:${page}:${limit}:${search}:${role}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                source: "redis-cache",
                ...JSON.parse(cachedValue)
            });
        }

        const filter : any = { _id: { $ne: req.user._id }, status: 'active' };

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
            severity: "HIGH",
            user_agent: req?.headers["user-agent"] || "",
            user_id: req.user._id,
            old_values: oldValues,
            new_values: updatedUser
        });

        await deleteCache("users:*")

        res.status(200).json({
            success: true,
            message: "User successfully updated",
            updatedUser
        });

    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let { currentPassword, newPassword, confirmPassword } = req.body;

        currentPassword = validator.trim(currentPassword || "");
        newPassword = validator.trim(newPassword || "");
        confirmPassword = validator.trim(confirmPassword || "");

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (
            !validator.isStrongPassword(newPassword, {
                minLength: 12, 
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        ) {
            return res.status(400).json({
                message:
                "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        const user = await User.findOne({
            _id: userId,
            status: "active",
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(403).json({
                message: "Current password is incorrect",
            });
        }

        const isSamePassword = await user.matchPassword(newPassword);

        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        user.password = newPassword;

        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });
        
    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
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

        await deleteCache("users:*")

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
        user.status = 'deleted';
        await user.save();

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

        await deleteCache("users:*")

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
        const cacheKey = `users:count`;
        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                source: "redis-cache",
                ...JSON.parse(cachedValue)
            });
        }

        const usersCount = await Role.aggregate([
        {
            $lookup: {
                from: "users",
                let: { roleId: "$_id" },
                pipeline: [
                    {
                    $match: {
                        $expr: { $eq: ["$role_id", "$$roleId"] },
                        status: "active",
                    },
                    },
                ],
                as: "users",
            },
        },
        {
            $project: {
                _id: 0,
                role_name: "$name",
                total: { $size: "$users" },
            },
        },
        ]);
        
        const responseData = {
            usersCount
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        })

        res.status(200).json({
            success: true,
            ...responseData
        })

    }catch(err) {
        next(err);
    }
}

export const isEmailExist = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const cacheKey = `users:${req.query.email}`;

        const cachedValue = await redisClient.get(cacheKey);

        if (cachedValue) {
            return res.status(200).json({
                success: true,
                ...JSON.parse(cachedValue)
            });
        }

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

        
        const responseData = {
            user: existingEmail,
            message: 'Email existed'
        }

        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60
        })

        return res.status(200).json({
            success: true,
            ...responseData
        })

    }catch(err){
        next(err);
    }
}