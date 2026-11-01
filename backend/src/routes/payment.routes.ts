import { Router } from "express";
import { createPayment, getPaymentById } from "../controllers/payment.controller.js";
import { authenticateApiKey } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint required in Section 2.B: POST /api/v1/payments/create
router.post("/create", authenticateApiKey, createPayment);

// Checkout page helper to retrieve payment request details
router.get("/:id", getPaymentById);

export default router;

