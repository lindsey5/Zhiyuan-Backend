import z from "zod";

export const createSponsoredItemsSchema = z.object({
    newSponsoredItems: z 
        .array(
            z.object({
                variant_id: z.string().min(1, "Variant ID is required"),
                quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than 0")
            })
            .strict()
        )
        .min(1, "At least one new sponsored item is required"),
}).strict()
