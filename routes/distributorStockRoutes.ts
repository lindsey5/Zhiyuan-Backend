import { Router } from "express";
import { createBulkDistributorStock, getDistributorStocks, getTotalDistributorStocks } from "../controllers/distributorStockController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
const router = Router();

router.post(
    '/:id', 
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_TRANSFER),
    createBulkDistributorStock
);

router.get(
    '/stock/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getTotalDistributorStocks
)

router.get(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW),
    getDistributorStocks
)

const distributorStockRoutes = router;

export default distributorStockRoutes;