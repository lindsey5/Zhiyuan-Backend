import { Router } from "express";
import { authenticate, authorizeDistributorCreation, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createDistributor, getDistributors, updateDistributor } from "../controllers/distributorController";
import validateBody from "../middlewares/validateBody";
import { createDistributorSchema, updateDistributorSchema } from "../schema/distributorSchema";

const router = Router();

router.post(
    '/',
    createRateLimiter(60 * 1000, 20),
    validateBody(createDistributorSchema),
    authenticate,
    authorizeDistributorCreation(),
    createDistributor
)

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_READ_ALL),
    getDistributors
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    validateBody(updateDistributorSchema),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_UPDATE),
    updateDistributor
)

const distributorRoutes = router;

export default distributorRoutes;