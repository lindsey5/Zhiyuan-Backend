import z from "zod";

export const createDistributorSchema = z.object({
    distributor_name: z.string()
        .min(1, "Distributor name is required")
        .max(100, "Distributor name must not exceed 100 characters"),
    email: z.string()
        .email('Invalid email ')
        .min(1, "Email is required")
        .max(100, "Email must not exceed 100 characters"),
    
    commission_rate: z.coerce.number()
        .positive('Commission Rate must be positive')
        .max(99.99, "Commission rate cannot be 100% or more")
}).strict();

export const updateDistributorSchema = z.object({
    distributor_name: z.string()
        .min(1, "Distributor name is required")
        .max(100, "Distributor name must not exceed 100 characters")
        .optional(),
    email: z.string()
        .email('Invalid email ')
        .min(1, "Email is required")
        .max(100, "Email must not exceed 100 characters")
        .optional(),
    
    commission_rate: z.coerce.number()
        .positive('Commission Rate must be positive')
        .max(99.99, "Commission rate cannot be 100% or more")
        .optional()
})