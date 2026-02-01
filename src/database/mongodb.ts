import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB Error:", error);
    process.exit(1);
  }
};
