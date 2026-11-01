import { Router } from "express";
import {
  createPayment,
  getPaymentById,
  getPaymentStatus,
  verifyPayment,
  handlePaymentWebhook,
  simulateBankWebhook,
} from "../controllers/payment.controller.js";
import { authenticateApiKey } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint required in Section 2.B: POST /api/v1/payments/create
router.post("/create", authenticateApiKey, createPayment);

// Standard payment webhook callback with HMAC-SHA256 signature verification
router.post("/webhook", handlePaymentWebhook);

// Checkout page helper to retrieve payment request details
router.get("/:id", getPaymentById);

// Lightweight polling endpoint for status
router.get("/:id/status", getPaymentStatus);

// Customer UTR verification endpoint (with duplicate prevention)
router.post("/:id/verify", verifyPayment);

// Simulated acquiring bank webhook callback
router.post("/:id/simulate-bank-callback", simulateBankWebhook);
router.post("/:id/simulate", simulateBankWebhook);

export default router;

