import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import productsRouter from "./routes/products.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/products", productsRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});