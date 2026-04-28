import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createOrder, getOrderById, getOrderMonthlySales, getOrders, getOrderSalesThisMonth, getOrderSalesThisWeek, getOrderSalesThisYear, getOrderSalesToday, orderMarkAsPaid, updateOrderStatus } from "../controllers/orderController";

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
    hasAnyPermission(PERMISSIONS.ORDER_READ_ALL, PERMISSIONS.ORDER_UPDATE),
    getOrders
)

router.get(
    '/sales/monthly',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.ORDER_SALES_VIEW),
    getOrderMonthlySales
)

router.get(
    '/sales/today',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_SALES_VIEW),
    getOrderSalesToday
)

router.get(
    '/sales/this-week',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_SALES_VIEW),
    getOrderSalesThisWeek
)

router.get(
    '/sales/this-month',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_SALES_VIEW),
    getOrderSalesThisMonth
)

router.get(
    '/sales/this-year',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.ORDER_SALES_VIEW),
    getOrderSalesThisYear
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    hasAnyPermission(PERMISSIONS.ORDER_READ_ALL, PERMISSIONS.ORDER_UPDATE),
    getOrderById
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