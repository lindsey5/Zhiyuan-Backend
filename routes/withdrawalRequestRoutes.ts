import { Router } from "express";
import { authenticate, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getWithdrawalRequestById, getWithdrawalRequests } from "../controllers/withdrawalRequestController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.WITHDRAWAL_REQUEST_VIEW_ALL, PERMISSIONS.WITHDRAWAL_REQUEST_UPDATE),
    getWithdrawalRequests
)

router.get(
    '/:id',
    createRateLimiter(5 * 60 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.WITHDRAWAL_REQUEST_VIEW_ALL, PERMISSIONS.WITHDRAWAL_REQUEST_UPDATE),
    getWithdrawalRequestById
)

const withdrawalRequestRoutes = router;

export default withdrawalRequestRoutes;