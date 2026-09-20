import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

/** Only active products are visible in the storefront. */
export async function listActive() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });

  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found.");
  }

  return product;
}