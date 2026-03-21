import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createRole, deleteRole, getAllRoles, getOwnRole, getRoleById, updateRole } from "../controllers/roleController";
import validateBody from "../middlewares/validateBody";
import { createAndUpdateRoleSchema } from "../schema/roleSchema";

const router = Router();

router.post(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_CREATE),
    validateBody(createAndUpdateRoleSchema),
    createRole
);

router.get(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_READ_ALL),
    getAllRoles
)

router.get(
    '/me',
    authenticate,
    getOwnRole
)

router.get(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_READ),
    getRoleById
)

router.put(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_UPDATE),
    validateBody(createAndUpdateRoleSchema),
    updateRole
)

router.delete(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_DELETE),
    deleteRole
)

const roleRoutes = router

export default roleRoutes;