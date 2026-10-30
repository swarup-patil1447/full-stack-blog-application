import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blogs.js";

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Set JWT_SECRET in server/.env to a long random value (at least 32 characters).");
  process.exit(1);
}

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(", ") });
  res.status(500).json({ message: "An unexpected server error occurred." });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blog_auth_dashboard");
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB. Check MONGODB_URI in server/.env.", error.message);
  process.exit(1);
}
