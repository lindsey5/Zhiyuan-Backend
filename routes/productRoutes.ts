import { Router } from "express";
import { handleMulterError, createProductUploads } from "../middlewares/multer";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createProduct, deleteProduct, getProductById, getProducts, searchProduct, updateProduct } from "../controllers/productController";
import validateBody from "../middlewares/validateBody";
import { createProductSchema, updateProductSchema } from "../schema/productSchema";

const router = Router();

router.post(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE),
    createProductUploads,
    validateBody(createProductSchema),
    handleMulterError,
    createProduct
);

router.get('/', getProducts);

router.get(
    '/search',
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_UPDATE),
    searchProduct,
)

router.get('/:id', getProductById);

router.delete(
    '/:id', 
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_DELETE),
    deleteProduct
)

router.put(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_UPDATE),
    validateBody(updateProductSchema),
    updateProduct
)

const productRoutes = router

export default productRoutes;