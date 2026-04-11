import { z } from "zod"

export const createUserSchema = z.object({
    firstname: z.string()
        .min(1, "Firstname is required")
        .max(50, "Firstname must not exceed 50 characters"),

    lastname: z.string()
        .min(1, "Lastname is required")
        .max(50, "Lastname must not exceed 50 characters"),

    email: z.string()
        .min(3, "Email must be at least 3 characters")
        .email("Invalid email address")
        .max(100, "Email must not exceed 100 characters"),

    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .max(100, "Password must not exceed 100 characters"),

    role_id: z.string()
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
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email must not exceed 100 characters")
        .optional(),
    
    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .max(100, "Password must not exceed 100 characters")
        .optional(),

    role_id: z.string().optional()
}).strict();

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current Password is required"),

    newPassword: z.string()
        .min(12, "Password must be at least 12 characters")
        .max(100, "Password must not exceed 100 characters")
        .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
        .regex(/[a-z]/, "Must include at least 1 lowercase letter")
        .regex(/[0-9]/, "Must include at least 1 number")
        .regex(/[^A-Za-z0-9]/, "Must include at least 1 special character"),
        
    confirmPassword: z.string().min(1, "Confirm Password is required"),
}).strict();