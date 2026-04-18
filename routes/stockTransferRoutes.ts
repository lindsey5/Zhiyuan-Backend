import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getStockTransferLogs, updateStockTransferLogStatus } from "../controllers/stockTransferController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_UPDATE, PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_VIEW_ALL),
    getStockTransferLogs
);

router.patch(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.STOCK_DISTRIBUTION_HISTORY_UPDATE),
    updateStockTransferLogStatus
)

const stockTransferRoutes = router;

export default stockTransferRoutes;