import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser, userGetOwn, userUpdateOwn } from "../controllers/userController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import validateBody from "../middlewares/validateBody";
import { createUserSchema, updateUserSchema } from "../schema/userSchema";

const router = Router();

router.post(
    '/', 
    authenticate, 
    authorizePermission(PERMISSIONS.USER_CREATE),
    validateBody(createUserSchema),
    createUser
);

router.get(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ_ALL),
    getUsers
);

router.put(
    '/me',
    authenticate,
    validateBody(updateUserSchema),
    userUpdateOwn
)

router.put(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_UPDATE),
    validateBody(updateUserSchema),
    updateUser
)

router.get(
    '/me',
    authenticate,
    userGetOwn
)

router.get(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ),
    getUserById
)

router.delete(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_DELETE),
    deleteUser
)

const userRoutes = router

export default userRoutes;