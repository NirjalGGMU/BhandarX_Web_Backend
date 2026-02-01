import express from "express";
import cors from "cors";
import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";  // Added
import { PORT } from "./config";
import path from "path";  // Added

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));  // Added for serving images

app.get("/", (req, res) => {
  res.json({ message: "BhandarX Auth API is running!" });
});
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminRoutes);  // Added

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
start();









// import express from "express";
// import cors from "cors";
// import { connectDB } from "./database/mongodb";
// import authRoutes from "./routes/auth.route";
// import { PORT } from "./config";

// const app = express();

// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ message: "BhandarX API is running!" });
// });

// app.use("/api/auth", authRoutes);

// const start = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// };

// start();
