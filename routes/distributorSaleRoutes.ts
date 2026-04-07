import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getAllDistributorSales, getDistributorSales } from "../controllers/distributorSaleController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
    getAllDistributorSales
)

router.get(
    '/:id',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
    getDistributorSales
)

const distributorSaleRoutes = router;

export default distributorSaleRoutes;