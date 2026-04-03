import { Router } from "express";
import { createBulkDistributorStock } from "../controllers/distributorStockController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
const router = Router();

router.post(
    '/:id', 
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_CREATE),
    createBulkDistributorStock
);

const distributorStockRoutes = router;

export default distributorStockRoutes;