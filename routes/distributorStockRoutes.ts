import { Router } from "express";
import { createBulkDistributorStock, downloadDistributorStocks, getDistributorStocks, getTotalDistributorStocks } from "../controllers/distributorStockController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import validateBody from "../middlewares/validateBody";
import { distributorStockSchema } from "../schema/distributorStockSchema";
const router = Router();

router.post(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    validateBody(distributorStockSchema),
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
    '/download/:id',
    createRateLimiter(5 * 60 * 1000, 5),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW),
    downloadDistributorStocks
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