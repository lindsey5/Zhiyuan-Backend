import { Router } from "express";
import { handleMulterError, productUploads, upload } from "../middlewares/multer";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createProduct } from "../controllers/productController";
import validateBody from "../middlewares/validateBody";
import { createProductSchema } from "../schema/productSchema";

const router = Router();

router.post(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE),
    productUploads,
    validateBody(createProductSchema),
    handleMulterError,
    createProduct
);

const productRoutes = router

export default productRoutes;