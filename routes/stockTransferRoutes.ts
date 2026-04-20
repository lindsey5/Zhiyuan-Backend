import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createStockTransfer, getStockTransferById, getStockTransferLogs, updateStockTransferLogStatus } from "../controllers/stockTransferController";
import validateBody from "../middlewares/validateBody";
import { distributorStockSchema } from "../schema/distributorStockSchema";

const router = Router();

router.post(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    validateBody(distributorStockSchema),
    authenticate,
    authorizePermission(PERMISSIONS.STOCK_DISTRIBUTION_CREATE),
    createStockTransfer
);

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_UPDATE, PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_VIEW_ALL),
    getStockTransferLogs
);

router.get(
    '/:id',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_UPDATE, PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_VIEW_ALL),
    getStockTransferById
)

router.patch(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_UPDATE),
    updateStockTransferLogStatus
)

const stockTransferRoutes = router;

export default stockTransferRoutes;