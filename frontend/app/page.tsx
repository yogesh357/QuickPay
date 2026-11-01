"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  QrCode,
  ArrowRight,
  Zap,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Smartphone,
  Check,
  Copy,
  Terminal,
  Store,
  Wallet,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const sampleSnippet = `curl -X POST http://localhost:5001/api/v1/payments/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: qp_live_demo9948274a102bc" \\
  -d '{
    "amount": 500,
    "order_id": "ORDER_101"
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-600/30 to-violet-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-brand-300 backdrop-blur-md shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Dynamic UPI QR Generator for Merchants</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Accept Direct UPI Payments on Your Website in{" "}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                One Simple API Call
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              QuickPay provides merchants with a lightweight API that turns any order amount
              into a dynamic UPI QR code. Customers scan with GPay, PhonePe, or Paytm and
              pay straight into your UPI ID.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30 hover:scale-[1.02]"
              >
                <span>Register Merchant Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/demo-store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                <Store className="w-4 h-4 text-brand-400" />
                <span>Launch Interactive Demo Store</span>
              </Link>
            </div>

            {/* UPI Brand badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-medium">
              <span>Works seamlessly with all UPI apps:</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  Google Pay
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  PhonePe
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  Paytm
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  BHIM UPI
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  CRED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-400 mb-2">
              Simple 3-Step Integration
            </h2>
            <p className="text-3xl font-bold tracking-tight text-white">
              How QuickPay Works for You
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-brand-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Register & Add Your UPI ID
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create your merchant account, configure your business name, and input your
                UPI ID (e.g. <span className="text-brand-300 font-mono">store@okaxis</span>). QuickPay issues a secure API key immediately.
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-brand-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Call the Payment QR API
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                When a buyer clicks checkout, your backend makes a simple POST to{" "}
                <span className="text-brand-300 font-mono">/api/v1/payments/create</span> with the order amount. QuickPay returns a dynamic Base64 QR code and UPI link.
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative hover:border-brand-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Customer Scans & Pays
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Render the QR on our hosted checkout or embed directly into your site.
                The customer scans the QR with any UPI app where the amount and your UPI ID are pre-filled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code & API Preview */}
      <section id="api-preview" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-950 border border-brand-800 text-xs font-semibold text-brand-300">
                <Code2 className="w-3.5 h-3.5" />
                <span>Single Endpoint Simplicity</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Integrate in minutes, not days
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                No complex webhooks, no cumbersome provider SDKs, and no funds withheld.
                QuickPay formats amounts in integer paise, generates standard UPI URI links, and creates high-resolution QR codes on the fly.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Standard UPI payment URI format: <code className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-300">upi://pay?pa=...&am=500.00</code></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Zero intermediary fees — direct customer to merchant payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Audited database history stored securely in PostgreSQL</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 font-medium text-sm text-white transition"
                >
                  Create API Key
                </Link>
                <Link
                  href="/demo-store"
                  className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-sm text-slate-200 border border-slate-700 transition"
                >
                  View Sample Store
                </Link>
              </div>
            </div>

            {/* Terminal Mockup */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-slate-400 text-xs ml-2">POST /api/v1/payments/create</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-slate-500 mb-1">// 1. Merchant Request</div>
                  <pre className="text-indigo-300 whitespace-pre-wrap">{sampleSnippet}</pre>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-slate-500 mb-1">// 2. QuickPay JSON Response (201 Created)</div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">{`{
  "order_id": "ORDER_101",
  "amount": 500,
  "upi_id": "merchant@okhdfcbank",
  "qr_code": "data:image/png;base64,iVBORw0KGgo...",
  "upi_link": "upi://pay?pa=merchant%40okhdfcbank&pn=MerchantName&am=500.00&cu=INR&tn=ORDER_101"
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">QuickPay</span> — Built for Indian UPI Merchant Ecosystem
          </div>
          <div>Strict UPI QR Generation Service (MVP)</div>
        </div>
      </footer>
    </div>
  );
}
