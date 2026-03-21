import { z } from "zod"

export const createUserSchema = z.object({
    firstname: z.string()
        .min(1, "Firstname is required")
        .max(50, "Firstname must not exceed 50 characters"),

    lastname: z.string()
        .min(1, "Lastname is required")
        .max(50, "Lastname must not exceed 50 characters"),

    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email address")
        .max(100, "Email must not exceed 100 characters"),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters"),

    role_id: z.string()
        .min(1, "Role ID is required")
        .max(20, "Role ID must not exceed 20 characters"),
}).strict();

export const updateUserSchema = z.object({
    firstname: z.string()
        .min(1, "Firstname cannot be empty")
        .max(50, "Firstname must not exceed 50 characters")
        .optional(),

    lastname: z.string()
        .min(1, "Lastname cannot be empty")
        .max(50, "Lastname must not exceed 50 characters")
        .optional(),

    email: z.string()
        .email("Invalid email address")
        .min(1, "Email cannot be empty")
        .max(100, "Email must not exceed 100 characters")
        .optional(),

    role_id: z.string()
        .min(1, "Role ID cannot be empty")
        .max(20, "Role ID must not exceed 20 characters")
        .optional(),
}).strict();