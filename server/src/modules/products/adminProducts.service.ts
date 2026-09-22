import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { paginate } from "../../utils/pagination.js";

export type AdminListQuery = {
  search?: string;
  isActive?: "true" | "false";
  sort?: "name" | "createdAt";
  page: number;
  limit: number;
};

export type ProductCreateInput = {
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  stock?: number;
};

export type ProductUpdateInput = Partial<ProductCreateInput> & {
  isActive?: boolean;
};

/** Admin list: every product (active or hidden), with search/filter/sort/pages. */
export async function listAdmin(query: AdminListQuery) {
  const { skip, take } = paginate(query.page, query.limit);

  const where: Prisma.ProductWhereInput = {
    ...(query.isActive
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" } }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "name" ? { name: "asc" } : { createdAt: "desc" };

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

export async function create(data: ProductCreateInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      imageUrl: data.imageUrl ?? null,
      stock: data.stock ?? 0,
    },
  });
}

export async function update(id: string, data: ProductUpdateInput) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.price !== undefined && {
        price: new Prisma.Decimal(data.price),
      }),
      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl ?? null,
      }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function remove(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  const hasOrders = await prisma.orderItem.findFirst({
    where: { productId: id },
  });

  if (hasOrders) {
    throw new AppError(
      409,
      "PRODUCT_HAS_ORDERS",
      "This product has orders and cannot be deleted."
    );
  }

  await prisma.product.delete({ where: { id } });
}