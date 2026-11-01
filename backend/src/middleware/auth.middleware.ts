import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { merchants, Merchant } from "../db/schema.js";
import { verifyJwtToken } from "../services/auth.service.js";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      merchant?: Merchant;
    }
  }
}

/**
 * Middleware to authenticate requests via Merchant API Key (e.g. for Payment QR API)
 */
export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKeyHeader = req.headers["x-api-key"] || req.headers["authorization"];

  if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
    res.status(401).json({
      error: "Authentication failed",
      message: "Missing 'x-api-key' or 'Authorization' header",
    });
    return;
  }

  // Handle both "x-api-key: qp_live_..." and "Authorization: Bearer qp_live_..."
  const apiKey = apiKeyHeader.startsWith("Bearer ")
    ? apiKeyHeader.slice(7).trim()
    : apiKeyHeader.trim();

  if (!apiKey) {
    res.status(401).json({
      error: "Authentication failed",
      message: "API key is required",
    });
    return;
  }

  try {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.apiKey, apiKey))
      .limit(1);

    if (!merchant) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid or inactive API key",
      });
      return;
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error("API Key auth error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}

/**
 * Middleware to authenticate merchant dashboard requests via JWT token
 */
export async function authenticateMerchantJwt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid authorization header",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyJwtToken(token);

  if (!payload || !payload.merchantId) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Session expired or invalid token",
    });
    return;
  }

  try {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, payload.merchantId))
      .limit(1);

    if (!merchant) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Merchant account not found",
      });
      return;
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error("JWT auth error:", error);
    res.status(500).json({ error: "Internal server error during session verification" });
  }
}
