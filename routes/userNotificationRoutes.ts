import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import createRateLimiter from "../utils/rate-limit";
import { getUserNotifications, readAllNotifications, readNotification } from "../controllers/userNotificationController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    getUserNotifications
)

router.patch(
    '/',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    readAllNotifications
)

router.patch(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    readNotification
)

const userNotificationRoutes = router;

export default userNotificationRoutes;