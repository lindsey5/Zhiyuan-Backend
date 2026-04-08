import { Router } from "express";
import { createBulkDistributorStock, getDistributorStocks, getTotalDistributorStocks } from "../controllers/distributorStockController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
const router = Router();

router.post(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_TRANSFER),
    createBulkDistributorStock
);

router.get(
    '/stock/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getTotalDistributorStocks
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW),
    getDistributorStocks
)

const distributorStockRoutes = router;

export default distributorStockRoutes;