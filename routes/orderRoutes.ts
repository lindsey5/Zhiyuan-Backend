import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getOrders } from "../controllers/orderController";

const router = Router();

router.get(
    '/',
    createRateLimiter(15 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_READ_ALL),
    getOrders
)

const orderRoutes = router;

export default orderRoutes;