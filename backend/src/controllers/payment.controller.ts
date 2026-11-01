import { Request, Response } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { paymentRequests } from "../db/schema.js";
import {
  inrToPaise,
  paiseToInrDecimal,
  generateUpiUri,
  generateQrCodeDataUrl,
  isValidUpiId,
} from "../services/upi.service.js";

const createPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount exceeds maximum limit for UPI transaction"),
  order_id: z
    .string({ invalid_type_error: "order_id must be a string" })
    .min(1, "order_id cannot be empty")
    .max(100, "order_id too long"),
});

/**
 * POST /api/v1/payments/create
 * Authenticated via Merchant API Key (x-api-key header)
 */
export async function createPayment(req: Request, res: Response): Promise<void> {
  const merchant = req.merchant;

  if (!merchant) {
    res.status(401).json({ error: "Unauthorized merchant" });
    return;
  }

  // Check merchant has configured UPI ID
  if (!merchant.upiId || !merchant.upiId.trim()) {
    res.status(400).json({
      error: "Merchant UPI ID missing",
      message:
        "Please configure your UPI ID in the QuickPay Merchant Dashboard before creating payment requests.",
    });
    return;
  }

  if (!isValidUpiId(merchant.upiId)) {
    res.status(400).json({
      error: "Invalid UPI ID",
      message: "Configured merchant UPI ID format is invalid.",
    });
    return;
  }

  const parseResult = createPaymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { amount, order_id } = parseResult.data;

  try {
    // 1. Store amounts as integer paise and convert to INR decimal format for UPI URI
    const amountPaise = inrToPaise(amount);
    const amountDecimal = paiseToInrDecimal(amountPaise);

    // 2. Generate UPI payment URI
    const upiLink = generateUpiUri({
      upiId: merchant.upiId,
      businessName: merchant.businessName,
      amountFormatted: amountDecimal,
      orderId: order_id,
    });

    // 3. Generate QR code using the `qrcode` npm package
    const qrCode = await generateQrCodeDataUrl(upiLink);

    // 4. Save payment request in PostgreSQL
    const [savedPayment] = await db
      .insert(paymentRequests)
      .values({
        merchantId: merchant.id,
        orderId: order_id,
        amountPaise,
        upiId: merchant.upiId,
        businessName: merchant.businessName,
        upiLink,
        qrCode,
      })
      .returning();

    // 5. Return exact required response format
    res.status(201).json({
      id: savedPayment.id,
      order_id: savedPayment.orderId,
      amount: amount,
      amount_paise: amountPaise,
      upi_id: savedPayment.upiId,
      business_name: savedPayment.businessName,
      qr_code: savedPayment.qrCode,
      upi_link: savedPayment.upiLink,
      created_at: savedPayment.createdAt,
    });
  } catch (error) {
    console.error("Error creating payment QR:", error);
    res.status(500).json({ error: "Failed to generate UPI QR code" });
  }
}

/**
 * GET /api/v1/payments/:id
 * Public or hosted checkout endpoint to retrieve payment details by payment ID
 */
export async function getPaymentById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Payment ID is required" });
    return;
  }

  try {
    const [payment] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, id))
      .limit(1);

    if (!payment) {
      res.status(404).json({ error: "Payment request not found" });
      return;
    }

    res.json({
      id: payment.id,
      order_id: payment.orderId,
      amount: payment.amountPaise / 100,
      amount_paise: payment.amountPaise,
      upi_id: payment.upiId,
      business_name: payment.businessName,
      qr_code: payment.qrCode,
      upi_link: payment.upiLink,
      created_at: payment.createdAt,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
}
