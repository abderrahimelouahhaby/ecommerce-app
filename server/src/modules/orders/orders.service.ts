import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { canAccessOrder, type AuthUser } from "../../lib/permissions.js";

export type CreateOrderInput = {
  items: { productId: string; quantity: number }[];
  shipping: { fullName: string; phone: string; address: string; city: string };
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
 * Cancels a PENDING order: restores product stock and marks it CANCELLED,
 * all inside one transaction so nothing is left half-done.
 */
export async function cancel(user: AuthUser, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    // Same ownership rule as getById: foreign orders look like 404s.
    if (!order || !canAccessOrder(user, order)) {
      throw new AppError(404, "NOT_FOUND", "Order not found.");
    }

    // Only a fresh, unpaid order can be cancelled.
    if (order.status !== "PENDING") {
      throw new AppError(
        409,
        "ORDER_NOT_CANCELLABLE",
        "Only pending orders can be cancelled."
      );
    }

    // Give every product its stock back, item by item.
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: orderInclude,
    });
  });
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
        ...body.shipping,
        items: { create: orderItems },
      },
      include: orderInclude,
    });
  });
}