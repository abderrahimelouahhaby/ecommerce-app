import { z } from "zod";

export const productIdParams = z.object({
  id: z.uuid("Invalid product ID"),
});

