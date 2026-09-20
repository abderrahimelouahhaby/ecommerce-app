import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { canAccessOrder, type AuthUser } from "../../lib/permissions.js";

export type CreateOrderInput = {
  items: { productId: string; quantity: number }[];
};

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  },
} as const;

export async function listMine(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

/** A customer sees only their own order; an admin sees any order. */
export async function getById(user: AuthUser, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order || !canAccessOrder(user, order)) {
    throw new AppError(404, "NOT_FOUND", "Order not found.");
  }

  return order;
}

/**
 * Creates the order in a single DB transaction: it checks stock,
 * reserves it, and writes the order + lines — all or nothing.
 */
export async function create(userId: string, body: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    let total = new Prisma.Decimal(0);

    const orderItems: {
      productId: string;
      quantity: number;
      price: Prisma.Decimal;
    }[] = [];

    for (const item of body.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new AppError(
          404,
          "PRODUCT_NOT_FOUND",
          "A product in this order could not be found."
        );
      }

      // updateMany + stock gte acts as an atomic "decrement if enough stock".
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: product.id,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (stockUpdate.count === 0) {
        throw new AppError(
          409,
          "INSUFFICIENT_STOCK",
          `Not enough stock available for ${product.name}.`
        );
      }

      total = total.add(product.price.mul(item.quantity));

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    return tx.order.create({
      data: {
        userId,
        total,
        items: { create: orderItems },
      },
      include: orderInclude,
    });
  });
}