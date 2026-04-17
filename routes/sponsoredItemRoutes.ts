import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getSponsoredItems } from "../controllers/sponsoredItemController";

const router = Router();

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    authorizePermission(PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL),
    getSponsoredItems
);

const sponsoredItemRoutes = router;

export default sponsoredItemRoutes;