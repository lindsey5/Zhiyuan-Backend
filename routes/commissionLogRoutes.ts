import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import { getCommissionsPerMonth } from "../controllers/commissionLogController";
import PERMISSIONS from "../utils/permissions";
const router = Router();

router.get(
    '/monthly/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STATS_VIEW),
    getCommissionsPerMonth
)

const commissionLogRoutes = router;

export default commissionLogRoutes;