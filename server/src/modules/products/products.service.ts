import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { paginate } from "../../utils/pagination.js";

export type ProductListQuery = {
  search?: string;
  sort?: "newest" | "priceLowHigh" | "priceHighLow";
  page: number;
  limit: number;
};

/** Storefront list: only active products, with search, sort, and pages. */
export async function list(query: ProductListQuery) {
  const { skip, take } = paginate(query.page, query.limit);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "priceLowHigh"
      ? { price: "asc" }
      : query.sort === "priceHighLow"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip, take }),
  ]);

  return {
    items,
    meta: {
      page: query.page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
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
