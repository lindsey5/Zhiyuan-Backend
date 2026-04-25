import { Router } from "express";
import createRateLimiter from "../utils/rate-limit";
import { createReview, getReviews } from "../controllers/reviewController";

const router = Router();

router.post(
    '/',
    createRateLimiter(60 * 1000, 20),
    createReview
)

router.get(
    '/',
     createRateLimiter(5 * 60 * 1000, 100),
     getReviews
)

const reviewRoutes = router;

export default reviewRoutes;