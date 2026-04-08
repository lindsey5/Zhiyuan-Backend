import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import { getCommissionsPerMonth } from "../controllers/commissionLogController";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
const router = Router();

router.get(
    '/monthly/:id',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getCommissionsPerMonth
)

const commissionLogRoutes = router;

export default commissionLogRoutes;