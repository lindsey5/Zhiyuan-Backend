import { z } from "zod";
import PERMISSIONS from "../utils/permissions";

export const createAndUpdateRoleSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must not exceed 50 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters long")
        .max(100, "Description must not exceed 100 characters"),

    permissions: z
        .array(z.enum(Object.values(PERMISSIONS)))
        .min(1, "At least one permission is required"),
}).strict();