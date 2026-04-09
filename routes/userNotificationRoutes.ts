import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getUserNotifications, readNotification } from "../controllers/userNotificationController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_NOTIFICATION),
    getUserNotifications
)

router.patch(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_NOTIFICATION),
    readNotification
)

const userNotificationRoutes = router;

export default userNotificationRoutes;