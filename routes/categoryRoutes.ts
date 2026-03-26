import { Router } from "express";
import validateBody from "../middlewares/validateBody";
import { categorySchema } from "../schema/categorySchema";
import { createCategory, getCategories, updateCategory } from "../controllers/categoryController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";

const router = Router();

router.post('/', 
    authenticate,
    authorizePermission(PERMISSIONS.CATEGORY_CREATE),
    validateBody(categorySchema), 
    createCategory
);

router.get('/', getCategories);

router.put('/:id', 
    authenticate,
    authorizePermission(PERMISSIONS.CATEGORY_UPDATE),
    validateBody(categorySchema),
    updateCategory
)

const categoryRoutes = router;

export default categoryRoutes;