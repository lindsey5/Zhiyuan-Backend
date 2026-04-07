import { Router } from "express";
import { createBulkDistributorStock, getDistributorStocks } from "../controllers/distributorStockController";
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
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_READ),
    getDistributorStocks
)

const distributorStockRoutes = router;

export default distributorStockRoutes;