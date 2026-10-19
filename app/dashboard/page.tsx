"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Building2,
  Shield,
  ShoppingCart,
  Train,
  Utensils,
  ArrowRight,
  TrendingUp,
  Bell,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("http://localhost:8000/dashboard/1");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    }

    load();
    const t = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (error)
    return (
      <div className="p-8 text-red-400">
        Error: {error}. Make sure the Python backend is running.
      </div>
    );
  if (!data) return <div className="p-8 text-slate-400">Loading dashboard…</div>;

  const balance = Number(data.account.balance).toLocaleString();
  const spending = [
    { name: "Accommodation", value: 32, color: "#3B82F6" },
    { name: "Food", value: 21, color: "#06B6D4" },
    { name: "Transport", value: 12, color: "#8B5CF6" },
    { name: "Study & Books", value: 10, color: "#EC4899" },
    { name: "Entertainment", value: 8, color: "#F59E0B" },
    { name: "Others", value: 17, color: "#64748B" },
  ];

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            placeholder="Search anything… (e.g. tuition, FX rate, my budget)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600"
          />
        </div>
        <button className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white">
          <span>🇧🇳</span>
          <span>Beijing, China</span>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Good morning, Farah! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here's your financial overview for your studies in China.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="text-slate-400 text-sm">
            Total Balance (All Accounts)
          </div>
          <div className="text-white text-3xl font-bold mt-3">
            BND {balance}
          </div>
          <div className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> 2.5% this week
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>🇧🇳</span> Brunei Dollar
          </div>
          <div className="text-white text-3xl font-bold mt-3">
            BND {balance}
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>🇨🇳</span> Chinese Yuan
          </div>
          <div className="text-white text-3xl font-bold mt-3">
            RMB 12,500.00
          </div>
          <div className="text-slate-500 text-sm mt-2">
            ≈ BND 2,950.00
          </div>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">Spending Breakdown</div>
            <div className="text-xs text-slate-500">This month ⌄</div>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart data={spending} />
            <div className="flex-1 space-y-2">
              {spending.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-slate-300">{s.name}</span>
                  </div>
                  <span className="text-slate-400">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">Upcoming Payments</div>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              View all →
            </button>
          </div>
          <div className="space-y-1">
            <PaymentRow
              icon={<GraduationCap size={20} />}
              label="University Tuition"
              amount="RMB 25,000"
              due="Due in 2 months · 15 Dec 2026"
              color="blue"
            />
            <PaymentRow
              icon={<Building2 size={20} />}
              label="Accommodation"
              amount="RMB 3,200"
              due="Due in 1 month · 5 Nov 2026"
              color="cyan"
            />
            <PaymentRow
              icon={<Shield size={20} />}
              label="Health Insurance"
              amount="RMB 800"
              due="Due in 3 months · 20 Dec 2026"
              color="purple"
            />
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Recent Transactions</div>
          <Link
            href="/transactions"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View all →
          </Link>
        </div>
        <div>
          <TxRow
            icon={<ShoppingCart size={18} />}
            label="Grocery Store"
            time="Today, 10:24"
            amount="- BND 42.30"
          />
          <TxRow
            icon={<Train size={18} />}
            label="Metro Transport"
            time="Yesterday, 18:12"
            amount="- RMB 12.00"
            sub="≈ BND 2.80"
          />
          <TxRow
            icon={<Utensils size={18} />}
            label="University Cafeteria"
            time="12 Oct 2026"
            amount="- RMB 18.00"
            sub="≈ BND 4.20"
          />
        </div>
      </Card>

      {/* Kai CTA */}
      <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-blue-900/50 p-8 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="max-w-md">
            <div className="text-white text-xl font-bold">
              Let Kai help you
            </div>
            <p className="text-slate-400 mt-2 text-sm">
              Ask anything about your finances, tuition payments, currency
              exchange or budgeting.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
            >
              Chat with Kai <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hidden md:block w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-2xl absolute right-0 top-0" />
        </div>
      </Card>
    </div>
  );
}

/* ============ Helper components ============ */

function DonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-40 h-40 flex-shrink-0">
      <svg viewBox="0 0 160 160" className="transform -rotate-90">
        {data.map((d, i) => {
          const len = (d.value / total) * circumference;
          const dash = `${len} ${circumference - len}`;
          const el = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-white text-xl font-bold">BND 1,240</div>
        <div className="text-slate-500 text-xs">Total Spent</div>
      </div>
    </div>
  );
}

function PaymentRow({
  icon,
  label,
  amount,
  due,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  due: string;
  color: string;
}) {
  const colors: any = {
    blue: "bg-blue-950 text-blue-400",
    cyan: "bg-cyan-950 text-cyan-400",
    purple: "bg-purple-950 text-purple-400",
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition">
      <div
        className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-slate-500 text-xs">{due}</div>
      </div>
      <div className="text-white text-sm font-semibold">{amount}</div>
    </div>
  );
}

function TxRow({
  icon,
  label,
  time,
  amount,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  amount: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-white text-sm">{label}</div>
        <div className="text-slate-500 text-xs">{time}</div>
      </div>
      <div className="text-right">
        <div className="text-red-400 text-sm font-medium">{amount}</div>
        {sub && <div className="text-slate-500 text-xs">{sub}</div>}
      </div>
    </div>
  );
}