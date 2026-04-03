import { Router } from "express";
import { createDistributor, getDistributors } from "../controllers/distributorController";
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

const distributorRoutes = router;

export default distributorRoutes;