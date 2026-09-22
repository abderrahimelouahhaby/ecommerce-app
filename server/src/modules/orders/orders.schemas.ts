import { z } from "zod";

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().min(1, "City is required."),
});

export const createOrderBody = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Order must contain at least one item"),
  shipping: shippingSchema,
});

export const orderIdParams = z.object({
  id: z.uuid(),
});
