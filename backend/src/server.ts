import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import merchantRoutes from "./routes/merchant.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);
app.use(express.json());

// Base health & info check
app.get("/", (_req, res) => {
  res.json({
    service: "QuickPay UPI QR Generation Service",
    status: "healthy",
    version: "1.0.0",
    docs: "/api/v1/payments/create",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/merchant", merchantRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`[QuickPay] Backend service running on http://localhost:${PORT}`);
});

export default app;
