import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";

const router = Router();

class OrderError extends Error {}



router.post(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const result = createOrderSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: "Invalid order data",
          errors: result.error.flatten().fieldErrors,
        });
      }

      if (!req.userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const userId = req.userId;
      const { items } = result.data;

      const order = await prisma.$transaction(async (tx) => {
        let total = new Prisma.Decimal(0);

        const orderItems: {
          productId: string;
          quantity: number;
          price: Prisma.Decimal;
        }[] = [];

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: {
              id: item.productId,
            },
          });

          if (!product) {
            throw new OrderError(
              `Product ${item.productId} not found`
            );
          }

          const stockUpdate = await tx.product.updateMany({
            where: {
              id: product.id,
              stock: { gte: item.quantity },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (stockUpdate.count === 0) {
            throw new OrderError(
              `Not enough stock for ${product.name}`
            );
          }

          const itemTotal = product.price.mul(item.quantity);

          total = total.add(itemTotal);

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
            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
          },
        });
      });

      return res.status(201).json({
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof OrderError) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to create order",
      });
    }
  }
);

export default router;