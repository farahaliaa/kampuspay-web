"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setTxs(data || []);
        setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 5000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
      <p className="text-sm text-gray-500 mb-6">Live ledger · last 50 transfers</p>

      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && txs.length === 0 && (
        <p className="text-gray-500">No transactions yet. Try a transfer in Chat.</p>
      )}

      {!loading && txs.length > 0 && (
        <div className="overflow-x-auto border border-gray-700 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr className="text-left text-gray-400">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Risk</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white">{t.purpose || "—"}</td>
                  <td className="px-4 py-3 text-right text-white font-mono">
                    {Number(t.amount).toLocaleString()} {t.ccy}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        t.risk_score >= 70
                          ? "bg-red-900/50 text-red-300"
                          : t.risk_score >= 30
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-green-900/50 text-green-300"
                      }`}
                    >
                      {t.risk_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${
                        t.status === "executed"
                          ? "text-green-400"
                          : t.status === "blocked"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      ● {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}