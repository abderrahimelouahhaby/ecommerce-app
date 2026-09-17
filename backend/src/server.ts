import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "MyShop API is running!" });
});

app.get("/test-db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});