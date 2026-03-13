import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role, User, Permission } from "../models";
import { UserWithRole } from "../types/types";

interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access token required" });
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
                    include: [{ model: Permission }]
                }
            ]
        });

        if (!user) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        const userData : UserWithRole = user.toJSON();

        req.user = userData;

        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const authorizePermission = (...requiredPermissions: string[]) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) return res.status(403).json({ error: "Forbidden: insufficient rights" });

        const userPermissions = req.user.role?.permissions || [];

        if (userPermissions.length === 0) return res.status(403).json({ error: "Forbidden: no role assigned" });

        const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                error: "Forbidden: insufficient permissions",
                required: requiredPermissions,
                current: userPermissions
            });
        }

        next();
    };
};