"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Dashboard = {
  user: { id: number; name: string; home_ccy: string; dest_ccy: string };
  account: { balance: number; currency: string };
  plan: { monthly_cap: number; tuition_due: number; stay_months: number };
  spent_30d: number;
  tx_count: number;
  projected_monthly: number;
  over_by: number;
  alert: boolean;
  recent: any[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/dashboard/1");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <p className="text-red-400">Error: {error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <p className="text-gray-500">Loading dashboard…</p>
      </main>
    );
  }

  const balance = Number(data.account.balance).toLocaleString();
  const cap = Number(data.plan.monthly_cap);
  const spentPct = cap > 0 ? Math.min(100, (data.spent_30d / cap) * 100) : 0;

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {data.user.name}
          </h1>
          <p className="text-sm text-gray-500">
            {data.user.home_ccy} → {data.user.dest_ccy} · {data.plan.stay_months}-month stay
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat" className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm">
            Chat with Kai
          </Link>
          <Link href="/audit" className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm border border-gray-700">
            Audit trail
          </Link>
        </div>
      </div>

      {/* Top row: balance + budget + tuition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
          <p className="text-xs uppercase text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-white mt-2">
            {balance} <span className="text-lg text-gray-400">{data.account.currency}</span>
          </p>
        </div>

        <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
          <p className="text-xs uppercase text-gray-500">Monthly Budget</p>
          <p className="text-3xl font-bold text-white mt-2">
            {cap.toLocaleString()} <span className="text-lg text-gray-400">/mo</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Spent: {data.spent_30d.toLocaleString()}</p>
        </div>

        <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
          <p className="text-xs uppercase text-gray-500">Tuition Due</p>
          <p className="text-3xl font-bold text-white mt-2">
            {Number(data.plan.tuition_due).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">in {data.plan.stay_months} months</p>
        </div>
      </div>

      {/* Budget bar */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">This month's spending</p>
          <p className="text-sm text-gray-400">{spentPct.toFixed(0)}% of cap</p>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${data.alert ? "bg-red-500" : spentPct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        {data.alert && (
          <p className="text-xs text-red-400 mt-2">
            ⚠ Projected to overspend by {data.over_by.toLocaleString()}
          </p>
        )}
      </div>

      {/* Recent activity */}
      <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">Recent activity</p>
          <p className="text-xs text-gray-500">{data.tx_count} transactions in 30 days</p>
        </div>
        {data.recent.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recent.map((t: any) => (
              <li key={t.id} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <div>
                  <span className="text-white">{t.purpose || "transfer"}</span>
                  <span className="text-gray-500 ml-2">· risk {t.risk_score}</span>
                </div>
                <div className="text-gray-400">
                  {Number(t.amount).toLocaleString()} {t.ccy}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}