"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Key, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";
import { Merchant } from "@/lib/api";

export default function DashboardHeader({
  merchant,
  title,
  subtitle,
}: {
  merchant: Merchant | null;
  title: string;
  subtitle: string;
}) {
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    if (!merchant?.api_key) return;
    navigator.clipboard.writeText(merchant.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {merchant?.upi_id ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                UPI Active
              </span>
            ) : (
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Add UPI ID
              </Link>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {merchant?.api_key && (
            <button
              onClick={handleCopyKey}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-100 transition shadow-sm"
              title="Click to copy API Key"
            >
              <Key className="w-3.5 h-3.5 text-brand-500" />
              <span>
                {merchant.api_key.slice(0, 10)}...{merchant.api_key.slice(-4)}
              </span>
              {copiedKey ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          )}

          <Link
            href="/demo-store"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold border border-brand-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Test Checkout Flow</span>
            <ExternalLink className="w-3 h-3 text-brand-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
