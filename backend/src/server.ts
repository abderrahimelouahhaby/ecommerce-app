import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "MyShop API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});