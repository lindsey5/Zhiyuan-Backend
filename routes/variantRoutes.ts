import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { getVariants, searchVariant } from "../controllers/variantController";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.get(
    '/',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    hasAnyPermission(
        PERMISSIONS.PRODUCT_CREATE, 
        PERMISSIONS.PRODUCT_READ_ALL, 
        PERMISSIONS.PRODUCT_UPDATE, 
        PERMISSIONS.PRODUCT_DELETE
    ),
    getVariants
)

router.get(
    '/search',
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_UPDATE),
    searchVariant,
)

const variantRoutes = router

export default variantRoutes;