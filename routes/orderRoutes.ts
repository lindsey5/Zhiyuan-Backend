import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getOrders } from "../controllers/orderController";

const router = Router();

router.get(
    '/',
    getOrders
)

const orderRoutes = router;

export default orderRoutes;