"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetPaymentById,
  PaymentRequest,
} from "@/lib/api";
import {
  QrCode,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  ArrowLeft,
  Clock,
  Sparkles,
  ExternalLink,
  Store,
  HelpCircle,
} from "lucide-react";

export default function HostedCheckoutPage() {
  const params = useParams();
  const id = params?.id as string;
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              UPI Verified
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1">
              #{payment.order_id}
            </span>
          </div>
        </div>

        {/* Amount to Pay */}
        <div className="text-center py-2">
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
            className="w-64 h-64 object-contain rounded-lg"
          />

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <Smartphone className="w-3.5 h-3.5 text-brand-600" />
            <span>Scan this QR code using any supported UPI application</span>
          </div>
        </div>

        {/* Supported UPI Apps Bar */}
        <div className="space-y-2">
          <div className="text-center text-[11px] text-slate-400 font-medium">
            Supported Payment Apps
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              GPay
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              PhonePe
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              Paytm
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              BHIM UPI
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              CRED
            </span>
          </div>
        </div>

        {/* Mobile Deep Link CTA */}
        <div className="space-y-2.5 pt-1">
          <a
            href={payment.upi_link}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in Installed UPI App</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Copy UPI ID details */}
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

        {/* Footer info notice */}
        <div className="border-t border-slate-800/80 pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Settles directly to <code className="text-slate-300 font-mono">{payment.upi_id}</code></span>
        </div>
      </div>
    </div>
  );
}
