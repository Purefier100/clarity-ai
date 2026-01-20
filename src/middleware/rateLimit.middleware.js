import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests. Please try again later.",
    },
});

// Strict limiter for AI routes
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 AI calls per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "AI rate limit exceeded. Please slow down.",
    },
});
