import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { paginate } from "../../utils/pagination.js";

type OrderStatus =
  "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

/** Which statuses each status may move to: forward only + PENDING → CANCELLED. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "DELIVERED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const adminOrderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} as const;

export type AdminOrdersListQuery = {
  search?: string;
  status?: OrderStatus;
  page: number;
  limit: number;
};

/** The statuses an order can move to next (used to render the UI buttons). */
export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status];
}

/** Admin list: every order, newest first, with search + status filter + pages. */
export async function listAdmin(query: AdminOrdersListQuery) {
  const { skip, take } = paginate(query.page, query.limit);

  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  {
                    firstName: { contains: query.search, mode: "insensitive" },
                  },
                  { lastName: { contains: query.search, mode: "insensitive" } },
                  { email: { contains: query.search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: adminOrderInclude,
    }),
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

export async function getById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderInclude,
  });

  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found.");
  }

  return {
    ...order,
    nextStatuses: nextStatuses(order.status as OrderStatus),
  };
}

/**
 * Advances an order through its lifecycle. The transition map is the
 * single source of truth; anything else is a 409. Cancelling restores
 * stock, all inside one transaction.
 */
export async function changeStatus(orderId: string, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new AppError(404, "NOT_FOUND", "Order not found.");
    }

    const allowed = TRANSITIONS[order.status as OrderStatus];

    if (!allowed.includes(status)) {
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot change an order from ${order.status} to ${status}.`,
      );
    }

    // Cancelling frees the products back into stock, same as a customer cancel.
    if (status === "CANCELLED") {
      const items = await tx.orderItem.findMany({ where: { orderId } });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: adminOrderInclude,
    });

    return {
      ...updated,
      nextStatuses: nextStatuses(status),
    };
  });
}
