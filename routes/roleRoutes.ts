import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createRole, deleteRole, getAllRoles, getOwnRole, getRoleById, updateRole } from "../controllers/roleController";
import validateBody from "../middlewares/validateBody";
import { createAndUpdateRoleSchema } from "../schema/roleSchema";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post(
    '/',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_CREATE),
    validateBody(createAndUpdateRoleSchema),
    createRole
);

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_READ_ALL, PERMISSIONS.AUDIT_VIEW_ALL),
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
    authorizePermission(PERMISSIONS.ROLE_READ),
    getRoleById
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_UPDATE),
    validateBody(createAndUpdateRoleSchema),
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