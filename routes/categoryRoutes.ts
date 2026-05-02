import { Router } from "express";
import validateBody from "../middlewares/validateBody";
import { categorySchema } from "../schema/categorySchema";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/categoryController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post('/', 
    createRateLimiter(60 * 1000, 20),
    validateBody(categorySchema), 
    authenticate,
    authorizePermission(PERMISSIONS.CATEGORY_CREATE),
    createCategory
);

router.get('/', 
    createRateLimiter(5 * 1000, 100),
    getCategories
);

router.put('/:id', 
    createRateLimiter(60 * 1000, 20),
    validateBody(categorySchema),
    authenticate,
    authorizePermission(PERMISSIONS.CATEGORY_UPDATE),
    updateCategory
)

router.delete(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.CATEGORY_DELETE),
    deleteCategory
)

const categoryRoutes = router;

export default categoryRoutes;