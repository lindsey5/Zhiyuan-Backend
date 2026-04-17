import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createOrder, getOrders, orderMarkAsPaid, updateOrderStatus } from "../controllers/orderController";

const router = Router();

router.post(
    '/',
    createRateLimiter(60 * 1000, 20),
    createOrder
)

router.get(
    '/',
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_READ_ALL),
    getOrders
)

router.patch(
    '/paid/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_UPDATE),
    orderMarkAsPaid
)

router.patch(
    '/status/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_UPDATE),
    updateOrderStatus
)

const orderRoutes = router;

export default orderRoutes;