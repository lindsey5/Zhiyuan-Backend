import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { searchVariant } from "../controllers/variantController";

const router = Router();

router.get(
    '/search',
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_UPDATE),
    searchVariant,
)

const variantRoutes = router

export default variantRoutes;