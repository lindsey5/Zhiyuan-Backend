import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/roleController";
import validateBody from "../middlewares/validateBody";
import { createRoleSchema, updateRoleSchema } from "../schema/roleSchema";

const router = Router();

router.post(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_CREATE),
    validateBody(createRoleSchema),
    createRole
);

router.get(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_READ_ALL),
    getAllRoles
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
    validateBody(updateRoleSchema),
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