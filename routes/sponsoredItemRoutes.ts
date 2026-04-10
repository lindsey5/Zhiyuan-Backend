import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createBulkSponsoredItem } from "../controllers/sponsoredItemController";

const router = Router();

router.post(
    '/', 
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.SPONSORED_ITEMS_CREATE),
    createBulkSponsoredItem
);

const sponsoredItemRoutes = router;

export default sponsoredItemRoutes;