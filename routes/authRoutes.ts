import { Router } from "express";
import { distributorLogin, distributorRefreshAccessToken, login, refreshAccessToken } from "../controllers/authController";
import validateBody from "../middlewares/validateBody";
import { loginSchema } from "../schema/loginSchema";
import createRateLimiter from "../utils/rate-limit";

const router = Router();

router.post(
    '/login', 
    createRateLimiter(15 * 60 * 1000, 5), 
    validateBody(loginSchema), 
    login
);

router.post(
    '/refreshToken', 
    createRateLimiter(15 * 60 * 1000, 5), 
    refreshAccessToken
);

router.post(
    '/login/distributor', 
    createRateLimiter(15 * 60 * 1000, 5), 
    validateBody(loginSchema), 
    distributorLogin
);

router.post(
    '/refreshToken/distributor', 
    createRateLimiter(15 * 60 * 1000, 5), 
    distributorRefreshAccessToken
);

const authRoutes = router;

export default authRoutes;