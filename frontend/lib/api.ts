const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export interface Merchant {
  id: string;
  email: string;
  business_name: string;
  upi_id: string | null;
  api_key: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRequest {
  id: string;
  order_id: string;
  amount: number;
  amount_paise: number;
  upi_id: string;
  business_name: string;
  qr_code: string;
  upi_link: string;
  created_at: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("quickpay_token");
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("quickpay_token", token);
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("quickpay_token");
  localStorage.removeItem("quickpay_merchant");
}

export function getStoredMerchant(): Merchant | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("quickpay_merchant");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredMerchant(merchant: Merchant): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("quickpay_merchant", JSON.stringify(merchant));
}

// 1. Auth API
export async function apiRegister(payload: {
  email: string;
  password: string;
  business_name: string;
  upi_id?: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
  return data;
}

export async function apiLogin(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Login failed");
  return data;
}

// 2. Merchant Dashboard API
export async function apiGetProfile(): Promise<Merchant> {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/merchant/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch profile");
  return data.merchant;
}

export async function apiUpdateSettings(payload: {
  business_name?: string;
  upi_id?: string;
}): Promise<Merchant> {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/merchant/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to update settings");
  return data.merchant;
}

export async function apiRegenerateApiKey(): Promise<string> {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/merchant/regenerate-api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to regenerate API key");
  return data.api_key;
}

export async function apiGetPayments(): Promise<PaymentRequest[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/merchant/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch payment history");
  return data.payments;
}

// 3. Payments Public / Checkout API
export async function apiCreatePayment(
  apiKey: string,
  payload: { amount: number; order_id: string }
): Promise<PaymentRequest> {
  const res = await fetch(`${API_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to create payment QR");
  return data;
}

export async function apiGetPaymentById(id: string): Promise<PaymentRequest> {
  const res = await fetch(`${API_URL}/payments/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Payment not found");
  return data;
}
