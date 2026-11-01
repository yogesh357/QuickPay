"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Store,
  QrCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Smartphone,
  RefreshCw,
  IndianRupee,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  getStoredMerchant,
  apiCreatePayment,
  PaymentRequest,
} from "@/lib/api";

const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_API_KEY ||
  "qp_live_4a6f50e459caf9a8b12cfcfdb683913206222ddb964b1083";

export default function DemoStorePage() {
  const [amount, setAmount] = useState<number>(500);
  const [orderId, setOrderId] = useState<string>("ORDER_101");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentRequest | null>(null);
  const [merchantName, setMerchantName] = useState<string>("Quantum Tech India");
  const [upiId, setUpiId] = useState<string>("quantum@okaxis");

  useEffect(() => {
    // Randomize initial order ID
    setOrderId(`ORDER_${Math.floor(100 + Math.random() * 900)}`);
    const merchant = getStoredMerchant();
    if (merchant) {
      if (merchant.business_name) setMerchantName(merchant.business_name);
      if (merchant.upi_id) setUpiId(merchant.upi_id);
    }
  }, []);

  const handleCheckout = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!orderId.trim()) {
      setError("Please enter an Order ID or reference note");
      return;
    }

    // Retrieve active merchant API key from session or fallback to default
    const merchant = getStoredMerchant();
    const activeApiKey = merchant?.api_key || DEFAULT_API_KEY;

    setError(null);
    setLoading(true);

    try {
      const result = await apiCreatePayment(activeApiKey.trim(), {
        amount: Number(amount),
        order_id: orderId.trim(),
      });

      setPaymentResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate UPI QR code");
    } finally {
      setLoading(false);
    }
  };

  const regenerateOrderId = () => {
    setOrderId(`ORDER_${Math.floor(100 + Math.random() * 900)}`);
  };

  const PRESET_AMOUNTS = [100, 250, 500, 1000];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-900/60 via-slate-800/80 to-slate-900/80 border border-brand-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl backdrop-blur-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Simple UPI Payment Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              UPI Checkout Demo
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enter any amount and order reference to generate a real-time, dynamic UPI payment QR code powered by the QuickPay API.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition self-start md:self-auto shrink-0 shadow-sm"
          >
            <Store className="w-4 h-4 text-brand-400" />
            <span>Merchant Dashboard</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Clean Simple Payment Form */}
          <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-brand-400" />
                  <span>Payment Details</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify the order amount to generate a dynamic UPI QR code.
                </p>
              </div>

              {/* Merchant Settlement Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Receiving UPI
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {upiId}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <label
                  htmlFor="payment-amount"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                >
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    id="payment-amount"
                    type="number"
                    min={1}
                    step="any"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="500"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        amount === val
                          ? "bg-brand-600 border-brand-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order ID / Reference Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="order-id"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    <span>Order Reference / ID</span>
                  </label>
                  <button
                    type="button"
                    onClick={regenerateOrderId}
                    className="text-[11px] text-slate-400 hover:text-brand-300 flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Randomize</span>
                  </button>
                </div>
                <input
                  id="order-id"
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORDER_101"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              {/* Merchant Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Payee: <strong className="text-white">{merchantName}</strong>
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Settlement: <span className="text-slate-300">{upiId}</span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || !amount || amount <= 0}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Generating Dynamic UPI QR...</span>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Pay ₹{amount || 0} with UPI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic UPI QR Preview & Result */}
          <div className="lg:col-span-5">
            {paymentResult ? (
              <div className="bg-slate-950 rounded-2xl border-2 border-emerald-500/40 shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      QR Generated Successfully
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    #{paymentResult.order_id}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-xs text-slate-400">Total Payable Amount</div>
                  <div className="text-3xl font-black text-white">
                    ₹{paymentResult.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Pre-filled to: <span className="font-mono text-slate-300">{paymentResult.upi_id}</span>
                  </div>
                </div>

                {/* Scannable QR Code */}
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xl flex flex-col items-center justify-center">
                  <img
                    src={paymentResult.qr_code}
                    alt="QuickPay Dynamic UPI QR"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                  <div className="mt-2 text-[11px] font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Scan using GPay, PhonePe, Paytm, or BHIM
                  </div>
                </div>

                {/* UPI URI details */}
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
                  <div className="text-slate-400 text-[11px] font-mono break-all">
                    <span className="text-slate-500 block mb-0.5">// UPI Payment URI</span>
                    {paymentResult.upi_link}
                  </div>

                  <a
                    href={paymentResult.upi_link}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                    <span>Open in Mobile UPI App</span>
                  </a>
                </div>

                <Link
                  href={`/checkout/${paymentResult.id}`}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-sm"
                >
                  <span>Open Dedicated Hosted Checkout Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-8 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Dynamic UPI QR Preview</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Enter an amount and click &quot;Pay with UPI&quot; to generate your live dynamic UPI QR code.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time Drizzle ORM + Express API</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
