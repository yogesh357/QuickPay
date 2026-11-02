"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetPaymentById,
  apiGetPaymentStatus,
  apiVerifyPayment,
  apiSimulatePayment,
  PaymentRequest,
} from "@/lib/api";
import {
  QrCode,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Store,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ExternalLink,
  Receipt,
  RotateCw,
} from "lucide-react";

export default function HostedCheckoutPage() {
  const params = useParams();
  const id = params?.id as string;
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // UTR verification form state
  const [utrInput, setUtrInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    if (!id) return;

    async function loadPayment() {
      try {
        const data = await apiGetPaymentById(id);
        setPayment(data);
      } catch (err: any) {
        setError(err.message || "Failed to load payment details");
      } finally {
        setLoading(false);
      }
    }

    loadPayment();
  }, [id]);

  // Polling for payment status (every 2.5 seconds until SUCCESS)
  useEffect(() => {
    if (!id || !payment || payment.status === "SUCCESS") return;

    const interval = setInterval(async () => {
      try {
        const statusData = await apiGetPaymentStatus(id);
        if (statusData.status === "SUCCESS") {
          setPayment((prev) =>
            prev
              ? {
                ...prev,
                status: "SUCCESS",
                utr: statusData.utr,
                paid_at: statusData.paid_at,
              }
              : null
          );
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [id, payment?.status]);

  const handleCopyUpiId = () => {
    if (!payment?.upi_id) return;
    navigator.clipboard.writeText(payment.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyLink = () => {
    if (!payment?.upi_link) return;
    navigator.clipboard.writeText(payment.upi_link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVerifyUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    const cleanUtr = utrInput.trim();
    if (!cleanUtr) {
      setVerifyError("Please enter the 12-digit UTR number from your UPI app");
      return;
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      setVerifyError("UTR must be exactly 12 digits (numeric)");
      return;
    }

    setVerifyError(null);
    setVerifying(true);

    try {
      const res = await apiVerifyPayment(id, cleanUtr);
      if (res.success && res.payment) {
        setPayment((prev) =>
          prev
            ? {
              ...prev,
              status: "SUCCESS",
              utr: res.payment.utr,
              paid_at: res.payment.paid_at,
            }
            : null
        );
      }
    } catch (err: any) {
      setVerifyError(err.message || "Failed to verify transaction");
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!id) return;
    setVerifyError(null);
    setVerifying(true);

    try {
      const res = await apiSimulatePayment(id);
      if (res.success && res.payment) {
        setPayment((prev) =>
          prev
            ? {
              ...prev,
              status: "SUCCESS",
              utr: res.payment.utr,
              paid_at: res.payment.paid_at,
            }
            : null
        );
      }
    } catch (err: any) {
      setVerifyError(err.message || "Simulation failed");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading QuickPay Checkout...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Payment Request Not Found</h1>
          <p className="text-xs text-slate-400">
            {error || "The requested payment order does not exist or has expired."}
          </p>
          <Link
            href="/demo-store"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
          >
            <span>Return to Sample Store</span>
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS SCREEN: When transaction is verified!
  if (payment.status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative z-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Success Checkmark Header */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Payment Confirmed & Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Transaction Successful!
            </h1>
            <p className="text-xs text-slate-400">
              Payment received by <strong className="text-white">{payment.business_name}</strong>
            </p>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Amount Paid</div>
            <div className="text-4xl font-black text-white">
              ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold pt-1">
              Settled to: <span className="font-mono">{payment.upi_id}</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-left text-xs space-y-2.5 font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Order Reference:</span>
              <span className="text-white font-bold">{payment.order_id}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Bank Reference (UTR):</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                {payment.utr || "Verified"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Verification Method:</span>
              <span className="text-emerald-400 font-bold">HMAC-SHA256 Signed Webhook</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Settlement Status:</span>
              <span className="text-emerald-400 font-bold">SUCCESS (CONFIRMED)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Date & Time:</span>
              <span className="text-slate-300">
                {new Date(payment.paid_at || payment.created_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Return CTA */}
          <div className="pt-2 space-y-2">
            <Link
              href="/demo-store"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30"
            >
              <span>Done & Return to Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Store className="w-3.5 h-3.5 text-brand-400" />
              <span>View in Merchant Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PENDING SCREEN: Scannable QR Code + UTR Verification Box
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Checkout Card */}
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header: Merchant Business Name & QuickPay Badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Paying Merchant
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {payment.business_name}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Awaiting Payment
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1">
              #{payment.order_id}
            </span>
          </div>
        </div>

        {/* Amount to Pay */}
        <div className="text-center py-1">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Amount Due
          </span>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
            ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact amount is pre-filled in your UPI payment app
          </p>
        </div>

        {/* Dynamic QR Code Display */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-indigo-500/40 shadow-xl flex flex-col items-center justify-center relative group">
          <img
            src={payment.qr_code}
            alt="Dynamic UPI QR Code"
            className="w-60 h-60 object-contain rounded-lg"
          />

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <Smartphone className="w-3.5 h-3.5 text-brand-600" />
            <span>Scan this QR code using any supported UPI application</span>
          </div>
        </div>

        {/* Supported UPI Apps Bar */}
        <div className="space-y-1.5">
          <div className="text-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Supported Payment Apps
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["GPay", "PhonePe", "Paytm", "BHIM UPI", "CRED"].map((app) => (
              <span
                key={app}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300"
              >
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Deep Link CTA */}
        <div className="space-y-2 pt-1">
          <a
            href={payment.upi_link}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in Installed UPI App</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Copy details */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyUpiId}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">UPI Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Intent Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BANK WEBHOOK & SETTLEMENT VERIFICATION */}
        <div className="bg-slate-950 rounded-2xl p-5 border border-brand-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Bank Webhook Verification
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              HMAC-SHA256
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            In production, upon payment completion, the acquiring bank / NPCI triggers a signed webhook to <code className="text-brand-300 font-mono text-[10px]">POST /api/v1/payments/webhook</code> with a cryptographic signature.
          </p>

          {/* Primary Action: Simulate Authentic Bank Webhook */}
          <button
            type="button"
            onClick={handleSimulateWebhook}
            disabled={verifying}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {verifying ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Processing Signed Bank Webhook...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Simulate Bank Callback (HMAC Webhook)</span>
              </>
            )}
          </button>

          {/* Secondary manual option: UTR entry */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span>Or verify via 12-digit UTR:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Unique check active</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ""))}
                placeholder="12-digit UTR (e.g. 429381749201)"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-brand-500 tracking-wider"
              />
              <button
                type="button"
                onClick={() => handleVerifyUtr()}
                disabled={verifying || utrInput.length !== 12}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition disabled:opacity-40 cursor-pointer"
              >
                Verify
              </button>
            </div>

            {verifyError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info notice */}
        <div className="border-t border-slate-800/80 pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Settles directly to <code className="text-slate-300 font-mono">{payment.upi_id}</code>
          </span>
        </div>
      </div>
    </div>
  );
}
