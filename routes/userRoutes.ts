import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser, userGetOwn, userUpdateOwn } from "../controllers/userController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import validateBody from "../middlewares/validateBody";
import { createProductSchema } from "../schema/productSchema";
import { updateUserSchema } from "../schema/userSchema";

const router = Router();

router.post(
    '/', 
    authenticate, 
    authorizePermission(PERMISSIONS.USER_CREATE),
    validateBody(createProductSchema),
    createUser
);

router.get(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ_ALL),
    getUsers
);

router.put(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_UPDATE),
    validateBody(updateUserSchema),
    updateUser
)

router.get(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ),
    getUserById
)

router.get(
    '/me',
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ_OWN),
    userGetOwn
)

router.put(
    '/me',
    authenticate,
    authorizePermission(PERMISSIONS.USER_UPDATE_OWN),
    validateBody(updateUserSchema),
    userUpdateOwn
)

router.delete(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.USER_DELETE),
    deleteUser
)

const userRoutes = router

export default userRoutes;