import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role, User, Permission } from "../models";
import { UserWithRole } from "../types/model";
import { AuthRequest } from "../types/auth";

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ 
            success: false, 
            message: "Access token required"
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string
        ) as JwtPayload;

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Role,
                    as: 'role',
                    include: [
                        { 
                            model: Permission,
                            as: 'permissions',
                            attributes: ['action']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
            return;
        }

        const userData : UserWithRole = user.toJSON();

        if (!userData.role) {
            res.status(401).json({ 
                success: false,
                message: "User role not found" 
            });
            return;
        }

        const { permissions, ...rest } = userData.role;

        const userPermissions = permissions?.map(permission => permission.action) || [];

        req.user = { ...userData, 
            role: {
                ...rest,
                permissions: userPermissions
            }
        };

        next();
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: "Unauthorized" 
        });
    }
};

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
                required: requiredPermissions,
                current: userPermissions
            });
        }

        next();
    };
};