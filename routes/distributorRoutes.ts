import { Router } from "express";
import { createDistributor, deleteDistributorById, getDistributorById, getDistributors } from "../controllers/distributorController";
import { authenticate, authorizePermission } from "../middlewares/authMiddleware";
import PERMISSIONS from "../utils/permissions";
const router = Router();

router.post(
    '/', 
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_CREATE),
    createDistributor
);

router.get(
    '/',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_READ_ALL),
    getDistributors
)

router.get(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_STOCK_VIEW, PERMISSIONS.DISTRIBUTOR_SALES_VIEW),
    getDistributorById
)

router.delete(
    '/:id',
    authenticate,
    authorizePermission(PERMISSIONS.DISTRIBUTOR_DELETE),
    deleteDistributorById
)

const distributorRoutes = router;

export default distributorRoutes;