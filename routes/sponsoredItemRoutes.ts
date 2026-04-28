import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";
import { getSponsoredItemById, getSponsoredItems, updateSponsoredItemStatus } from "../controllers/sponsoredItemController";

const router = Router();

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    hasAnyPermission(PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL, PERMISSIONS.SPONSORED_PRODUCT_UPDATE),
    getSponsoredItems
);

router.get(
    '/:id',
    createRateLimiter(5 * 1000, 100), 
    authenticate,
    hasAnyPermission(PERMISSIONS.SPONSORED_PRODUCT_VIEW_ALL, PERMISSIONS.SPONSORED_PRODUCT_UPDATE),
    getSponsoredItemById
)

router.patch(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.SPONSORED_PRODUCT_UPDATE),
    updateSponsoredItemStatus
)

const sponsoredItemRoutes = router;

export default sponsoredItemRoutes;