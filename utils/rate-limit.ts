import rateLimit from "express-rate-limit";

export default function createRateLimiter(windowMs: number, limit: number) {
    const limiter = rateLimit({
        windowMs: windowMs,
        limit: limit,
        message: { error: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    return limiter;
}