import { z } from "zod";

export const productIdParams = z.object({
  id: z.uuid("Invalid product ID"),
});

export const adminListQuery = z.object({
  search: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z.enum(["name", "createdAt"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const productCreateBody = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  price: z.coerce
    .number()
    .nonnegative("Price cannot be negative.")
    .refine((value) => Math.round(value * 100) / 100 === value, {
      message: "Price can have at most 2 decimal places.",
    }),
  imageUrl: z.url("Image URL must be a valid URL.").nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const productUpdateBody = productCreateBody
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });