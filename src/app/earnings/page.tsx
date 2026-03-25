"use client";

import { useEffect, useState } from "react";
import { influencerApi } from "@/lib/api";
import { Loader2, DollarSign, Clock, CheckCircle2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Commission {
  _id: string;
  order_id: string;
  order_total: number;
  original_order_total?: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  cancellation_reason?: string;
  created_at: string;
}

interface Summary {
  total_earnings: number;
  pending_earnings: number;
  approved_earnings: number;
  paid_earnings: number;
  total_orders: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function EarningsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      influencerApi.getEarnings(),
      influencerApi.getCommissions(filter || undefined),
    ])
      .then(([s, c]) => {
        setSummary(s.data);
        setCommissions(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const summaryCards = summary
    ? [
        { label: "Total Earnings", value: summary.total_earnings, icon: DollarSign },
        { label: "Pending", value: summary.pending_earnings, icon: Clock },
        { label: "Approved", value: summary.approved_earnings, icon: CheckCircle2 },
        { label: "Paid", value: summary.paid_earnings, icon: DollarSign },
        { label: "Orders", value: summary.total_orders, icon: ShoppingBag, isCurrency: false },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your commissions and payouts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
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
            <p className="text-xl font-bold text-slate-900">
              {card.isCurrency === false
                ? card.value
                : `₹${(card.value as number).toLocaleString("en-IN")}`}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        {["", "pending", "approved", "paid", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors",
              filter === s
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Commission Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Date
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Order ID
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Order Total
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Rate
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Commission
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {commissions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 italic"
                >
                  No commissions found.
                </td>
              </tr>
            ) : (
              commissions.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3 text-slate-600">
                    {new Date(c.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">
                    {c.order_id.slice(-8)}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    <div className="flex flex-col">
                      {c.original_order_total && c.original_order_total !== c.order_total ? (
                        <>
                          <span className="line-through text-slate-400 text-xs">₹{c.original_order_total.toLocaleString("en-IN")}</span>
                          <span>₹{c.order_total.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-amber-600">
                            {c.status === "cancelled" ? "Order cancelled" : "Item cancelled"}
                          </span>
                        </>
                      ) : (
                        <span>₹{c.order_total.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {(c.commission_rate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-3 font-bold text-emerald-700">
                    ₹{c.commission_amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border w-fit",
                          STATUS_STYLES[c.status] || "bg-slate-50 text-slate-500 border-slate-200"
                        )}
                      >
                        {c.status}
                      </span>
                      {c.status === "cancelled" && c.cancellation_reason && (
                        <span className="text-[10px] text-red-500 max-w-[180px]" title={c.cancellation_reason}>
                          {c.cancellation_reason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
