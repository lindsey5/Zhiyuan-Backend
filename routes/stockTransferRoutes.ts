import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getStockTransferLogs } from "../controllers/stockTransferController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.TRANSFER_LOGS_VIEW_ALL),
    getStockTransferLogs
)

const stockTransferRoutes = router;

export default stockTransferRoutes;