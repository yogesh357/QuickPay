"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Settings,
  Store,
  LogOut,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { clearStoredAuth, getStoredMerchant } from "@/lib/api";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const merchant = getStoredMerchant();

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/login");
  };

  const navItems = [
    {
      name: "Overview & History",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "API Keys & Integration",
      href: "/dashboard/integration",
      icon: Code2,
      active: pathname === "/dashboard/integration",
    },
    {
      name: "Merchant Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
    {
      name: "Sample Checkout Demo",
      href: "/demo-store",
      icon: Store,
      active: pathname === "/demo-store",
      badge: "Sandbox",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">QuickPay</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded ml-auto">
            v1.0
          </span>
        </Link>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <nav className="space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Merchant Center
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  item.active
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? "text-brand-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 pt-6 border-t border-slate-100">
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-xs text-slate-500 font-medium">Logged in as</div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {merchant?.business_name || "Merchant"}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{merchant?.email}</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
