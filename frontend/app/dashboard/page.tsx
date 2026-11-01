"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import {
  apiGetProfile,
  apiGetPayments,
  Merchant,
  PaymentRequest,
  getStoredToken,
} from "@/lib/api";
import {
  QrCode,
  ArrowUpRight,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Search,
  AlertTriangle,
  Receipt,
  IndianRupee,
  Calendar,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function DashboardOverview() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [profileData, paymentsData] = await Promise.all([
          apiGetProfile(),
          apiGetPayments(),
        ]);
        setMerchant(profileData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredPayments = payments.filter((p) =>
    p.order_id.toLowerCase().includes(search.toLowerCase()) ||
    p.upi_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <DashboardSidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          merchant={merchant}
          title="Merchant Dashboard"
          subtitle="Manage your UPI payment requests and monitor integration health."
        />

        <div className="p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Missing UPI ID warning banner */}
          {merchant && !merchant.upi_id && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">
                    UPI ID Configuration Needed
                  </h3>
                  <p className="text-xs text-amber-700">
                    Add your merchant UPI ID to enable dynamic payment QR generation on your store.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition shrink-0"
              >
                Configure UPI ID
              </Link>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Total Requests
                </span>
                <Receipt className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {payments.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Generated UPI QR codes</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Total Requested Volume
                </span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-1">Sum of generated orders</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Destination UPI ID
                </span>
                <QrCode className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 truncate">
                {merchant?.upi_id || "Not configured"}
              </div>
              <div className="text-xs text-slate-400 mt-1">Direct settlement handle</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">
                  API Key Status
                </span>
                <Sparkles className="w-4 h-4 text-brand-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-slate-900">Live & Active</span>
              </div>
              <Link
                href="/dashboard/integration"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 inline-flex items-center gap-1"
              >
                <span>View Integration Docs</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Section D: Payment Request History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Request History
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record of all dynamic UPI payment requests created through QuickPay API.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Order ID..."
                    className="pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 w-48 sm:w-60"
                  />
                </div>

                <Link
                  href="/demo-store"
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition shrink-0"
                >
                  + New Test Payment
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400">
                Loading payment records...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No payment requests yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Payment requests will appear here once you generate QR codes using your merchant API key or from our sample checkout store.
                </p>
                <div className="mt-4">
                  <Link
                    href="/demo-store"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold border border-brand-200 transition"
                  >
                    Try Sample Merchant Store
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">UPI ID</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                          {p.order_id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{p.amount.toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            ({p.amount_paise} paise)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {p.upi_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(p.created_at).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedPayment(p)}
                              className="px-2.5 py-1.5 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium text-[11px] flex items-center gap-1 transition"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View QR</span>
                            </button>

                            <Link
                              href={`/checkout/${p.id}`}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-[11px] flex items-center gap-1 transition"
                            >
                              <span>Checkout</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Dynamic UPI QR
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Order #{selectedPayment.order_id}
              </h3>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{selectedPayment.amount.toFixed(2)}
              </p>
            </div>

            {/* Rendered QR Code */}
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center mb-4">
              <img
                src={selectedPayment.qr_code}
                alt="UPI QR Code"
                className="w-56 h-56 object-contain rounded-lg"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Merchant:</span>
                <span className="font-semibold text-slate-800">
                  {selectedPayment.business_name}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>UPI ID:</span>
                <span className="font-mono text-slate-800">
                  {selectedPayment.upi_id}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Created At:</span>
                <span className="text-slate-800">
                  {new Date(selectedPayment.created_at).toLocaleTimeString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCopyLink(selectedPayment.upi_link)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>UPI Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Raw UPI URI</span>
                  </>
                )}
              </button>

              <Link
                href={`/checkout/${selectedPayment.id}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition shadow-sm"
              >
                <span>Open Hosted Checkout Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
