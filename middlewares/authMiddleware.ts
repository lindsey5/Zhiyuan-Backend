import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/auth";
import User from "../models/User";
import Role from "../models/Role";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
        // Fetch user from MongoDB
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
        }

        // Fetch role with permissions
        const role = await Role.findById(user.role_id)
        .populate({ path: "permissions", select: "action -_id" })
        .lean();

        const userPermissions = role?.permissions?.map((p: any) => p.action) || [];

        // Attach user and role info to request
        req.user = {
            ...user,
            role: {
                ...role,
                permissions: userPermissions,
            },
        };

        next();
    } catch (error: any) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized",
        });
    }
};

export const hasAnyPermission = (...anyPermissions: string []) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) return res.status(403).json({ 
            success: false,
            message: "Forbidden: insufficient rights"
         });

        const userPermissions = req.user.role?.permissions || [];

        if (userPermissions.length === 0) return res.status(403).json({ 
            success: false,
            message: "Forbidden: no permission assigned" 
        });

        const hasAnyPermission = anyPermissions.some(permission => 
            userPermissions.includes(permission)
        );

        if (!hasAnyPermission) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }
        next();
    }
}

export const authorizePermission = (...requiredPermissions: string[]) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) return res.status(403).json({ 
            success: false,
            message: "Forbidden: insufficient rights"
         });

        const userPermissions = req.user.role?.permissions || [];

        if (userPermissions.length === 0) return res.status(403).json({ 
            success: false,
            message: "Forbidden: no permission assigned" 
        });

        const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };
};