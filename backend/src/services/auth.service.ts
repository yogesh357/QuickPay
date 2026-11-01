import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "quickpay_jwt_super_secret_key_2026_production_ready";

export function generateApiKey(): string {
  const random = crypto.randomBytes(24).toString("hex");
  return `qp_live_${random}`;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateJwtToken(merchantId: string): string {
  return jwt.sign({ merchantId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwtToken(token: string): { merchantId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { merchantId: string };
  } catch {
    return null;
  }
}
