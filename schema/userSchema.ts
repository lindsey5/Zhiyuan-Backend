import { z } from "zod"

export const createUserSchema = z.object({
    firstname: z.string()
        .min(1, "Firstname is required"),
    lastname: z.string()
        .min(1, "Lastname is required"),
    email: z.string()
        .email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
    role_id: z.string()
        .min(1, "Role ID is required"),
}).strict();

export const updateUserSchema = z.object({
    firstname: z.string()
        .min(1, "Firstname cannot be empty")
        .optional(),
    lastname: z.string()
        .min(1, "Lastname cannot be empty")
        .optional(),
    email: z.string()
        .email("Invalid email address")
        .optional(),
    role_id: z.string()
        .min(1, "Role ID cannot be empty")
        .optional(),
}).strict();