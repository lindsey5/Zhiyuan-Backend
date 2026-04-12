import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getReturnRequests, updateAllReturnRequestItems, updateReturnRequestItem } from "../controllers/returnRequestController";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_VIEW, PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE),
    getReturnRequests
)

router.put(
    '/:return_id/:distributor_id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE),
    updateAllReturnRequestItems
)

router.patch(
    '/:return_id/:distributor_id/:variant_id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE),
    updateReturnRequestItem
)

const returnRequestRoutes = router;

export default returnRequestRoutes;