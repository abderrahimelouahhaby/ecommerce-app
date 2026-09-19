import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import productsRouter from "./routes/products.routes.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});