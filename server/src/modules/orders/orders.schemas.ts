import { z } from "zod";

export const createOrderBody = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export const orderIdParams = z.object({
  id: z.uuid(),
});