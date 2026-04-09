import * as z from 'zod';

export const distributorSchema = z.object({
    distributor_name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must not exceed 100 characters"),
    email: z
        .string()
        .email('Invalid email address')
        .max(100, "Email must not exceed 100 characters"),
    parent_distributor_id: z 
        .string()
        .optional()
}).strict()
