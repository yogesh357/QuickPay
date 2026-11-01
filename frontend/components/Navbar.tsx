"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QrCode, ArrowRight, Store, ShieldCheck, User } from "lucide-react";
import { getStoredToken } from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getStoredToken());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                QuickPay
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                UPI QR
              </span>
            </div>
            <span className="text-[11px] text-slate-500 -mt-0.5">
              Merchant Checkout API
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="/#how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
          <Link href="/#api-preview" className="hover:text-brand-600 transition-colors">
            API Reference
          </Link>
          <Link
            href="/demo-store"
            className="flex items-center gap-1.5 hover:text-brand-600 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-500" />
            <span>UPI Checkout Demo</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition shadow-sm hover:shadow-brand-500/25"
            >
              <User className="w-4 h-4" />
              <span>Merchant Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition shadow-sm hover:shadow-brand-500/25"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
