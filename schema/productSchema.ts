import { z } from "zod";

const createVariantSchema = z.object({
    variant_name: z.string()
        .min(3, "Variant name must be at least 3 characters")
        .max(100, "Variant name must not exceed 100 characters"),

    price: z.coerce.number()
        .positive("Variant price must be positive"),

    stock: z.coerce.number()
        .int()
        .nonnegative("Stock must be 0 or more"),

    sku: z.string()
        .min(3, "SKU must be at least 3 characters")
        .max(100, "SKU must not exceed 100 characters"),
}).strict();

export const createProductSchema = z.object({
    product_name: z.string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name must not exceed 100 characters"),

    description: z.string()
        .min(5, "Description must be at least 5 characters")
        .max(1000, "Description must not exceed 1000 characters"),

    category: z.string().nonempty('Category is required'),

    variants: z.preprocess((val) => {
        if (typeof val === "string") return JSON.parse(val);
        return val;
    }, z.array(createVariantSchema))
})
.refine((data) => data.variants.length > 0, {
    message: "At least one variant is required",
    path: ["variants"],
})
.strict();


const updateVariantSchema = z.object({
    id: z.number().optional(),

    variant_name: z.string()
        .min(3, "Variant name must be at least 3 characters")
        .max(100, "Variant name must not exceed 100 characters"),

    price: z.coerce.number()
        .positive("Variant price must be positive"),

    stock: z.coerce.number()
        .int()
        .nonnegative("Stock must be 0 or more"),

    sku: z.string()
        .min(3, "SKU must be at least 3 characters")
        .max(100, "SKU must not exceed 100 characters"),

    image_url: z.string()
        .nonempty("Variant image URL is required")
        .optional()
});

export const updateProductSchema = z.object({
    product_name: z.string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name must not exceed 100 characters")
        .optional(),

    description: z.string()
        .min(5, "Description must be at least 5 characters")
        .max(1000, "Description must not exceed 1000 characters")
        .optional(),

    thumbnail_url: z.string().optional(),

    category: z.string().nonempty('Category is required'),

    variants: z.array(updateVariantSchema),
})
.refine((data) => !data.variants || data.variants.length > 0, {
    message: "At least one variant is required",
    path: ["variants"]
})
.strict();