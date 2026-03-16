import { z } from "zod";

const variantSchema = z.object({
    variant_name: z.string(),
    price: z.number(),
    stock: z.number(),
});

export const createProductSchema = z.object({
    product_name: z.string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name can be at most 100 characters"),
    
    description: z.string()
        .min(5, "Description must be at least 5 characters")
        .max(100, "Description can be at most 100 characters"),
    
    variants: z.union([
        z.string().transform((val) => JSON.parse(val) as z.infer<typeof variantSchema>[]),
        z.array(variantSchema)
    ])
    })
    .refine((data) => data.variants.length > 0, {
        message: "At least one variant is required",
        path: ["variants"],
    })
.strict();