import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { createBulkSponsoredItem, getSponsoredItems } from "../controllers/sponsoredItemController";
import validateBody from "../middlewares/validateBody";
import { createSponsoredItemsSchema } from "../schema/sponsoredItemSchema";

const router = Router();

router.post(
    '/', 
    createRateLimiter(60 * 1000, 20),
    validateBody(createSponsoredItemsSchema),
    authenticate,
    authorizePermission(PERMISSIONS.SPONSORED_PRODUCT_CREATE),
    createBulkSponsoredItem
);

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    authorizePermission(PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL),
    getSponsoredItems
);

const sponsoredItemRoutes = router;

export default sponsoredItemRoutes;