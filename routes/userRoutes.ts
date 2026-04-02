import { Router } from "express";
import { createUser, deleteUser, getUsers, getUsersCount, updateUser, userGetOwn, userUpdateOwn } from "../controllers/userController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import validateBody from "../middlewares/validateBody";
import { createUserSchema, updateUserSchema } from "../schema/userSchema";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post(
    '/', 
    createRateLimiter(60 * 1000, 20),
    authenticate, 
    authorizePermission(PERMISSIONS.USER_CREATE),
    validateBody(createUserSchema),
    createUser
);

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.USER_READ_ALL),
    getUsers
);

router.put(
    '/me',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    validateBody(updateUserSchema),
    userUpdateOwn
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.USER_UPDATE),
    validateBody(updateUserSchema),
    updateUser
)

router.get(
    '/me',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    userGetOwn
)

router.get(
    '/count',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_DELETE, PERMISSIONS.USER_READ_ALL),
    getUsersCount
)

router.delete(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.USER_DELETE),
    deleteUser
)

const userRoutes = router

export default userRoutes;