import { z } from "zod";
import PERMISSIONS from "../utils/permissions";

export const createRoleSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name can be at most 50 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(100, "Description can be at most 100 characters"),
    permission: z
        .array(z.enum(Object.values(PERMISSIONS)))
        .min(1, "At least one permission is required"),
}).strict();

export const updateRoleSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name can be at most 50 characters")
        .optional(),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(100, "Description can be at most 100 characters")
        .optional(),
    permission: z
        .array(z.enum(Object.values(PERMISSIONS)))
        .min(1, "At least one permission is required")
        .optional(),
}).strict();