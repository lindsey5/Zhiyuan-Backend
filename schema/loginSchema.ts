import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(100, "Email must not exceed 100 characters"),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters")
})
.strict();