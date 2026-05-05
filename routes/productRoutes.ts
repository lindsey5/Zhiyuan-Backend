import { Router } from "express";
import { handleMulterError, createProductUploads } from "../middlewares/multer";
import { authenticate, authorizePermission, hasAnyPermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
import { createProduct, deleteProduct, getLowStockProducts, getBestSellingProducts, getProductById, getProducts, getTotalLowStockProducts, getTotalProducts, searchProduct, updateProduct } from "../controllers/productController";
import validateBody from "../middlewares/validateBody";
import { createProductSchema, updateProductSchema } from "../schema/productSchema";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post(
    '/', 
    createRateLimiter(60 * 1000, 20),
    createProductUploads,
    handleMulterError,
    validateBody(createProductSchema),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_CREATE),
    createProduct
);

router.get(
    '/', 
    createRateLimiter(5 * 1000, 100), 
    getProducts
);

router.get(
    '/search',
    authenticate,
    hasAnyPermission(PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_UPDATE),
    searchProduct,
)

router.get(
    '/best-selling',
    createRateLimiter(5 * 1000, 100),
    getBestSellingProducts
)

router.get(
    '/total',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DASHBOARD_VIEW),
    getTotalProducts
)

router.get(
    '/low-stocks',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_LOW_STOCK_VIEW),
    getLowStockProducts
)

router.get(
    '/low-stocks/total',
    createRateLimiter(5 * 1000, 100),
    authenticate,
    authorizePermission(PERMISSIONS.DASHBOARD_VIEW),
    getTotalLowStockProducts
)

router.get(
    '/:id', 
    createRateLimiter(5 * 1000, 100), 
    getProductById
);

router.delete(
    '/:id', 
    createRateLimiter(60 * 1000, 20),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_DELETE),
    deleteProduct
)

router.put(
    '/:id',
    createRateLimiter(60 * 1000, 20),
    validateBody(updateProductSchema),
    authenticate,
    authorizePermission(PERMISSIONS.PRODUCT_UPDATE),
    updateProduct
)

const productRoutes = router

export default productRoutes;