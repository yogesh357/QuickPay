import { Request, Response } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { merchants, paymentRequests } from "../db/schema.js";
import {
  generateApiKey,
  hashPassword,
  comparePassword,
  generateJwtToken,
} from "../services/auth.service.js";
import { isValidUpiId } from "../services/upi.service.js";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  business_name: z.string().min(2, "Business name must be at least 2 characters long"),
  upi_id: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const updateSettingsSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters long").optional(),
  upi_id: z.string().optional(),
});

/**
 * Merchant Registration
 */
export async function registerMerchant(req: Request, res: Response): Promise<void> {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password, business_name, upi_id } = parseResult.data;

  if (upi_id && upi_id.trim() && !isValidUpiId(upi_id.trim())) {
    res.status(400).json({
      error: "Invalid UPI ID",
      message: "Please provide a valid UPI ID (e.g. merchant@okhdfcbank or store@upi)",
    });
    return;
  }

  try {
    // Check if email already registered
    const [existing] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Email is already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const apiKey = generateApiKey();

    const [newMerchant] = await db
      .insert(merchants)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        businessName: business_name.trim(),
        upiId: upi_id ? upi_id.trim() : null,
        apiKey,
      })
      .returning();

    const token = generateJwtToken(newMerchant.id);

    res.status(201).json({
      message: "Merchant registered successfully",
      token,
      merchant: {
        id: newMerchant.id,
        email: newMerchant.email,
        business_name: newMerchant.businessName,
        upi_id: newMerchant.upiId,
        api_key: newMerchant.apiKey,
        created_at: newMerchant.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register merchant" });
  }
}

/**
 * Merchant Login
 */
export async function loginMerchant(req: Request, res: Response): Promise<void> {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.email, email.toLowerCase().trim()))
      .limit(1);

    if (!merchant) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await comparePassword(password, merchant.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateJwtToken(merchant.id);

    res.json({
      message: "Login successful",
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        business_name: merchant.businessName,
        upi_id: merchant.upiId,
        api_key: merchant.apiKey,
        created_at: merchant.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
}

/**
 * Get Merchant Profile
 */
export async function getMerchantProfile(req: Request, res: Response): Promise<void> {
  const merchant = req.merchant;
  if (!merchant) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({
    merchant: {
      id: merchant.id,
      email: merchant.email,
      business_name: merchant.businessName,
      upi_id: merchant.upiId,
      api_key: merchant.apiKey,
      created_at: merchant.createdAt,
      updated_at: merchant.updatedAt,
    },
  });
}

/**
 * Update Merchant Settings (Business Name and UPI ID)
 */
export async function updateMerchantSettings(req: Request, res: Response): Promise<void> {
  const merchant = req.merchant;
  if (!merchant) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parseResult = updateSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { business_name, upi_id } = parseResult.data;

  if (upi_id && upi_id.trim() && !isValidUpiId(upi_id.trim())) {
    res.status(400).json({
      error: "Invalid UPI ID",
      message: "Please provide a valid UPI ID (e.g. merchant@okhdfcbank or store@upi)",
    });
    return;
  }

  try {
    const updateData: Partial<typeof merchants.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (business_name !== undefined) {
      updateData.businessName = business_name.trim();
    }

    if (upi_id !== undefined) {
      updateData.upiId = upi_id ? upi_id.trim() : null;
    }

    const [updatedMerchant] = await db
      .update(merchants)
      .set(updateData)
      .where(eq(merchants.id, merchant.id))
      .returning();

    res.json({
      message: "Settings updated successfully",
      merchant: {
        id: updatedMerchant.id,
        email: updatedMerchant.email,
        business_name: updatedMerchant.businessName,
        upi_id: updatedMerchant.upiId,
        api_key: updatedMerchant.apiKey,
        updated_at: updatedMerchant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
}

/**
 * Regenerate API Key
 */
export async function regenerateApiKey(req: Request, res: Response): Promise<void> {
  const merchant = req.merchant;
  if (!merchant) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const newApiKey = generateApiKey();

    const [updated] = await db
      .update(merchants)
      .set({
        apiKey: newApiKey,
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, merchant.id))
      .returning();

    res.json({
      message: "API key regenerated successfully",
      api_key: updated.apiKey,
    });
  } catch (error) {
    console.error("Regenerate API key error:", error);
    res.status(500).json({ error: "Failed to regenerate API key" });
  }
}

/**
 * Get Merchant Payment Requests History
 */
export async function getMerchantPayments(req: Request, res: Response): Promise<void> {
  const merchant = req.merchant;
  if (!merchant) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payments = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.merchantId, merchant.id))
      .orderBy(desc(paymentRequests.createdAt));

    const formatted = payments.map((p) => ({
      id: p.id,
      order_id: p.orderId,
      amount: p.amountPaise / 100,
      amount_paise: p.amountPaise,
      upi_id: p.upiId,
      business_name: p.businessName,
      upi_link: p.upiLink,
      qr_code: p.qrCode,
      created_at: p.createdAt,
    }));

    res.json({ payments: formatted });
  } catch (error) {
    console.error("Fetch payments error:", error);
    res.status(500).json({ error: "Failed to retrieve payment history" });
  }
}
