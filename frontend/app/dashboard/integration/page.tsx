"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import {
  apiGetProfile,
  apiRegenerateApiKey,
  Merchant,
  getStoredToken,
  setStoredMerchant,
} from "@/lib/api";
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCw,
  Code2,
  Terminal,
  FileCode,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function IntegrationPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">("curl");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const data = await apiGetProfile();
        setMerchant(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [router]);

  const handleCopyKey = () => {
    if (!merchant?.api_key) return;
    navigator.clipboard.writeText(merchant.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Are you sure you want to regenerate your API key? The existing key will stop working immediately.")) {
      return;
    }

    setRegenerating(true);
    try {
      const newKey = await apiRegenerateApiKey();
      if (merchant) {
        const updated = { ...merchant, api_key: newKey };
        setMerchant(updated);
        setStoredMerchant(updated);
      }
    } catch (err) {
      alert("Failed to regenerate API key");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopySnippet = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(tab);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const apiKeyVal = merchant?.api_key || "qp_live_your_api_key_here";

  const snippets = {
    curl: `curl -X POST http://localhost:5001/api/v1/payments/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyVal}" \\
  -d '{
    "amount": 500,
    "order_id": "ORDER_101"
  }'`,

    node: `// Modern Fetch / Next.js / Node.js
async function createQuickPayQR(orderId, amount) {
  const response = await fetch("http://localhost:5001/api/v1/payments/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${apiKeyVal}",
    },
    body: JSON.stringify({
      amount: amount, // in INR e.g. 500
      order_id: orderId,
    }),
  });

  const data = await response.json();
  console.log("QR Code Data URL:", data.qr_code);
  console.log("UPI Intent Link:", data.upi_link);
  return data;
}`,

    python: `import requests

url = "http://localhost:5001/api/v1/payments/create"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKeyVal}"
}
payload = {
    "amount": 500,
    "order_id": "ORDER_101"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print("QR Code Base64:", data["qr_code"])
print("UPI Link:", data["upi_link"])`,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <DashboardSidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          merchant={merchant}
          title="API Keys & Integration"
          subtitle="Generate, rotate and use your secret merchant API keys for UPI QR checkout."
        />

        <div className="p-6 md:p-8 max-w-5xl space-y-8">
          {/* API Key Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-600" />
                  <span>Production API Key</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send this key in the <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">x-api-key</code> header with every payment request.
                </p>
              </div>

              <button
                onClick={handleRegenerateKey}
                disabled={regenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition self-start sm:self-auto disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                <span>Roll / Regenerate Key</span>
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl p-3 border border-slate-800 font-mono text-sm">
              <span className="flex-1 truncate select-all px-2">
                {showKey ? merchant?.api_key : (merchant?.api_key ? "••••••••••••••••••••••••••••••••••••••••••••" : "Loading...")}
              </span>

              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={showKey ? "Hide API Key" : "Show API Key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopyKey}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-sans font-medium transition"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Keep your API key secret. Do not expose it in public client-side JavaScript repositories.
              </span>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Integration Instructions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Call the payment endpoint from your server when an order is created.
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("curl")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "curl"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab("node")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "node"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Node.js / Fetch
                </button>
                <button
                  onClick={() => setActiveTab("python")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "python"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="bg-slate-950 p-5 font-mono text-xs relative">
              <button
                onClick={() => handleCopySnippet(snippets[activeTab], activeTab)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition"
              >
                {copiedSnippet === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Code</span>
                  </>
                )}
              </button>

              <pre className="text-slate-200 overflow-x-auto pr-24 leading-relaxed">
                {snippets[activeTab]}
              </pre>
            </div>

            {/* Expected Response Documentation */}
            <div className="p-6 bg-slate-50/70 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                JSON Response Structure (HTTP 201 Created)
              </h4>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{`{
  "order_id": "ORDER_101",
  "amount": 500,
  "amount_paise": 50000,
  "upi_id": "${merchant?.upi_id || "merchant@upi"}",
  "business_name": "${merchant?.business_name || "Merchant Business"}",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSU...",
  "upi_link": "upi://pay?pa=${encodeURIComponent(merchant?.upi_id || "merchant@upi")}&pn=${encodeURIComponent(merchant?.business_name || "Merchant")}&am=500.00&cu=INR&tn=ORDER_101"
}`}</pre>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Displaying the QR:
                  </span>
                  Use the returned <code className="text-brand-600 font-mono">qr_code</code> string directly in an <code className="text-slate-800 font-mono">&lt;img src=&#123;data.qr_code&#125; /&gt;</code> element on your checkout page.
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Mobile App Intent:
                  </span>
                  On mobile devices, you can link users directly to their UPI app with <code className="text-brand-600 font-mono">&lt;a href=&#123;data.upi_link&#125;&gt;Pay via UPI App&lt;/a&gt;</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
