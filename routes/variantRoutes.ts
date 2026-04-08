import { Router } from "express";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { deleteVariant, downloadVariants, getVariants, searchVariant, updateVariant } from "../controllers/variantController";
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

router.get(
    '/download',
    createRateLimiter(5 * 60 * 1000, 5),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_READ_ALL, PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_DELETE, PERMISSIONS.PRODUCT_UPDATE),
    downloadVariants
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_UPDATE),
    updateVariant
)

router.delete(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_UPDATE),
    deleteVariant
)

const variantRoutes = router

export default variantRoutes;