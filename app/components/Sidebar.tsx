"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Wallet,
  ListOrdered,
  Target,
  TrendingUp,
  GraduationCap,
  LineChart,
  Settings,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/chat", label: "Kai AI", icon: MessageCircle },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/dashboard", label: "Accounts", icon: Wallet },
  { href: "/dashboard", label: "Budget & Goals", icon: Target },
  { href: "/simulator", label: "FX & Exchange", icon: TrendingUp },
  { href: "/dashboard", label: "Tuition Payments", icon: GraduationCap },
  { href: "/audit", label: "Insights", icon: LineChart },
  { href: "/audit", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0 h-screen">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
          K
        </div>
        <div>
          <div className="text-white font-bold leading-tight">KampusPay</div>
          <div className="text-xs text-slate-500">Study Smart. Pay Smarter.</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item, i) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-900 cursor-pointer transition">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            FA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">Farah Aliaa</div>
            <div className="text-xs text-slate-500 truncate">🇧🇳 Brunei → 🇨🇳 China</div>
          </div>
        </div>
      </div>
    </aside>
  );
}