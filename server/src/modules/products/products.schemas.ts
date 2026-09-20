import { z } from "zod";

export const productIdParams = z.object({
  id: z.string().uuid("Invalid product ID"),
});

