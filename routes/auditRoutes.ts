import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { getAuditLogs } from "../controllers/auditLogController";

const router = Router();

router.get(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.AUDIT_VIEW_ALL),
    getAuditLogs
)

const auditRoutes = router;

export default auditRoutes;