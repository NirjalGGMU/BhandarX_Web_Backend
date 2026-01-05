import express from "express";
import { config } from "./config";
import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

connectDB();

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
