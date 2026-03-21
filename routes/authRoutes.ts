import { Router } from "express";
import { login, refreshAccessToken } from "../controllers/authController";
import validateBody from "../middlewares/validateBody";
import { loginSchema } from "../schema/loginSchema";

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/refreshToken', refreshAccessToken);

const authRoutes = router;

export default authRoutes;