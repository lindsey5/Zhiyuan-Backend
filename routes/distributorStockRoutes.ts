import { Router } from "express";
import { downloadDistributorStocks, getDistributorStock, getDistributorStocks, getTotalDistributorStocks } from "../controllers/distributorStockController";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
const router = Router();

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
    '/:variant_id/:distributor_id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_VIEW, PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE),
    getDistributorStock
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