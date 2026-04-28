import { Router } from "express";
import { createDistributor, deleteDistributorById, getDistributorById, getDistributors, getTopDistributors, getTotalDistributors } from "../controllers/distributorController";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { distributorSchema } from "../schema/distributorSchema";
import validateBody from "../middlewares/validateBody";
const router = Router();

router.post(
    '/', 
    validateBody(distributorSchema),
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_CREATE),
    createDistributor
);

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(
        PERMISSIONS.DISTRIBUTOR_READ_ALL, 
        PERMISSIONS.DISTRIBUTOR_STOCK_VIEW, 
        PERMISSIONS.DISTRIBUTOR_SALES_VIEW, 
        PERMISSIONS.DISTRIBUTOR_STATS_VIEW, 
        PERMISSIONS.DISTRIBUTOR_CREATE,
        PERMISSIONS.DISTRIBUTOR_DELETE,
        PERMISSIONS.STOCK_DISTRIBUTION_CREATE,
    ),
    getDistributors
)

router.get(
    '/top',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_RANKINGS_VIEW),
    getTopDistributors
)

router.get(
    '/total',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DASHBOARD_VIEW),
    getTotalDistributors
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW, PERMISSIONS.DISTRIBUTOR_SALES_VIEW, PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getDistributorById
)

router.delete(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_DELETE),
    deleteDistributorById
)

const distributorRoutes = router;

export default distributorRoutes;