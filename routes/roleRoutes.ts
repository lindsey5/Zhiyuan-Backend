import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/roleController";

const router = Router();

router.post(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.ROLE_CREATE),
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