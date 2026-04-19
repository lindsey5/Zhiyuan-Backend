import { Router } from "express";
import { authenticate, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getSponsoredItems } from "../controllers/sponsoredItemController";

const router = Router();

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    hasAnyPermission(PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL, PERMISSIONS.SPONSORED_PRODUCT_CREATE),
    getSponsoredItems
);

const sponsoredItemRoutes = router;

export default sponsoredItemRoutes;