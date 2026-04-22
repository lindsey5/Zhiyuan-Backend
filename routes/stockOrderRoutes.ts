import { Router } from "express";
import { authenticate, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getStockOrderById, getStockOrders } from "../controllers/stockOrderController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.STOCK_ORDERS_UPDATE, PERMISSIONS.STOCK_ORDERS_VIEW_ALL),
    getStockOrders
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.STOCK_ORDERS_UPDATE, PERMISSIONS.STOCK_ORDERS_VIEW_ALL),
    getStockOrderById
)

const stockOrderRoutes = router;

export default stockOrderRoutes;