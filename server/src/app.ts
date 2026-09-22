import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import productsRouter from "./modules/products/products.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import ordersRouter from "./modules/orders/orders.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import adminProductsRouter from "./modules/products/adminProducts.routes.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/products", productsRouter);
  app.use("/api/admin/products", adminProductsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/orders", ordersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
