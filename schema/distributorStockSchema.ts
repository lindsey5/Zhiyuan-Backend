import z from 'zod';

export const distributorStockSchema = z.array(
    z.object({
        variant_id: z.string(),
        quantity: z.number().int().positive(),
    }).strict()
);