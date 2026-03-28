import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role, User, Permission } from "../database/models";
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
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
            return;
        }

        const userData : any = user.toJSON();

        const role = await Role.findByPk(userData.role_id, {
            include: [
                {
                    model: Permission,
                    as: 'permissions'
                }
            ]
        })

        const userPermissions = (role?.toJSON() as any)?.permissions?.map((permission : any) => permission.action) || [];

        req.user = { ...userData, 
            role: {
                ...role?.toJSON(),
                permissions: userPermissions
            }
        };

        next();
    } catch (error : any) {
        console.log(error)
        res.status(401).json({ 
            success: false,
            message: error.message || 'Unauthorized'
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