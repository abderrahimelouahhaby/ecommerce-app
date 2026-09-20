import { Router } from "express";
import {prisma} from "../lib/prisma.js";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId || !/^[0-9a-fA-F-]{36}$/.test(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

export default router;