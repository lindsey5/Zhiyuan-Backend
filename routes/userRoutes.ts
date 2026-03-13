import { Router } from "express";
import { createUser, getUsers } from "../controllers/userController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";

const router = Router();

router.post(
    '/', 
    authenticate, 
    authorizePermission(PERMISSIONS.USER_CREATE),
    createUser
);

router.get(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ_ALL),
    getUsers
);

const userRoutes = router

export default userRoutes;