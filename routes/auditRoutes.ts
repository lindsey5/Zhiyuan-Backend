import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { getAuditLogs } from "../controllers/auditLogController";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.get(
    '/',
    createRateLimiter(15 * 60 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.AUDIT_VIEW_ALL),
    getAuditLogs
)

const auditRoutes = router;

export default auditRoutes;