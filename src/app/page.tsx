"use client";

import { useEffect, useState } from "react";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import { influencerApi } from "@/lib/api";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";

interface EarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  approved_earnings: number;
  paid_earnings: number;
  total_orders: number;
}

export default function DashboardPage() {
  const { user } = useInfluencerStore();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const storefrontUrl = user?.username
    ? `https://decume.in/${user.username}?ref=${user.username}`
    : null;

  useEffect(() => {
    influencerApi
      .getEarnings()
      .then((r) => setEarnings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!storefrontUrl) return;
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cards = earnings
    ? [
        {
          label: "Total Earnings",
          value: `₹${earnings.total_earnings.toLocaleString("en-IN")}`,
          icon: DollarSign,
          color: "emerald",
        },
        {
          label: "Pending",
          value: `₹${earnings.pending_earnings.toLocaleString("en-IN")}`,
          icon: Clock,
          color: "amber",
        },
        {
          label: "Approved",
          value: `₹${earnings.approved_earnings.toLocaleString("en-IN")}`,
          icon: CheckCircle2,
          color: "blue",
        },
        {
          label: "Paid",
          value: `₹${earnings.paid_earnings.toLocaleString("en-IN")}`,
          icon: DollarSign,
          color: "emerald",
        },
        {
          label: "Total Orders",
          value: earnings.total_orders,
          icon: ShoppingBag,
          color: "slate",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
        </p>
      </div>

      {/* Storefront Link */}
      {storefrontUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <LinkIcon size={18} className="text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                Your Storefront
              </p>
              <p className="text-sm font-medium text-emerald-700 truncate">
                {storefrontUrl}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="ml-4 flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse h-28"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {card.label}
                </span>
                <card.icon size={16} className="text-slate-300" />
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
