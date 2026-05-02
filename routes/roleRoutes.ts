import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createRole, deleteRole, getAllRoles, getOwnRole, getRoleById, updateRole } from "../controllers/roleController";
import validateBody from "../middlewares/validateBody";
import { createAndUpdateRoleSchema } from "../schema/roleSchema";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post(
    '/',
    createRateLimiter(60 * 1000, 20),
    validateBody(createAndUpdateRoleSchema),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_CREATE),
    createRole
);

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(
        PERMISSIONS.ROLE_READ_ALL, 
        PERMISSIONS.AUDIT_VIEW_ALL, 
        PERMISSIONS.USER_CREATE, 
        PERMISSIONS.USER_READ_ALL, 
        PERMISSIONS.USER_DELETE, 
        PERMISSIONS.USER_UPDATE
    ),
    getAllRoles
)

router.get(
    '/me',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    getOwnRole
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_UPDATE),
    getRoleById
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    validateBody(createAndUpdateRoleSchema),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_UPDATE),
    updateRole
)

router.delete(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_DELETE),
    deleteRole
)

const roleRoutes = router

export default roleRoutes;