import QRCode from "qrcode";

export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export function isValidUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== "string") return false;
  return UPI_ID_REGEX.test(upiId.trim());
}

/**
 * Converts INR amount (e.g. 500 or 500.50) into integer paise (e.g. 50000 or 50050)
 */
export function inrToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts integer paise into INR decimal string formatted to 2 decimal places (e.g. 500.00)
 */
export function paiseToInrDecimal(paise: number): string {
  return (paise / 100).toFixed(2);
}

/**
 * Generates standard UPI payment URI
 * Example: upi://pay?pa=merchant@upi&pn=MerchantName&am=500.00&cu=INR&tn=ORDER_101
 */
export function generateUpiUri(params: {
  upiId: string;
  businessName: string;
  amountFormatted: string;
  orderId: string;
}): string {
  const { upiId, businessName, amountFormatted, orderId } = params;
  
  // Clean values for query parameters
  const pa = encodeURIComponent(upiId.trim());
  const pn = encodeURIComponent(businessName.trim());
  const am = amountFormatted;
  const cu = "INR";
  const tn = encodeURIComponent(orderId.trim());

  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;
}

/**
 * Generates Base64 Data URL QR Code image from text
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 420,
    color: {
      dark: "#090d16",
      light: "#ffffff",
    },
  });
}
