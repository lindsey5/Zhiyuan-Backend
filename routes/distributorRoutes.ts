import { Router } from "express";
import { createDistributor, deleteDistributorById, getDistributorById, getDistributors, getTopDistributors } from "../controllers/distributorController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
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
    authorizePermission(PERMISSIONS.DISTRIBUTOR_READ_ALL),
    getDistributors
)

router.get(
    '/top',
    createRateLimiter(5 * 1000, 100),
    getTopDistributors
)

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW, PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
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