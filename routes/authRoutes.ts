import { Router } from "express";
import { login } from "../controllers/authController";
import validateBody from "../middlewares/validateBody";
import { loginSchema } from "../schema/loginSchema";

const router = Router();

router.post('/login', validateBody(loginSchema), login);

const authRoutes = router

export default authRoutes;