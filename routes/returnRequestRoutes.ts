import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { updateAllReturnRequestItems } from "../controllers/returnRequestController";

const router = Router();

router.put(
    '/:return_id/:distributor_id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_RETURN_REQUEST_UPDATE),
    updateAllReturnRequestItems
)

const returnRequestRoutes = router;

export default returnRequestRoutes;