"use client";

import { useState, useEffect } from "react";

export default function SimulatorPage() {
  const [shock, setShock] = useState(5);
  const [pair, setPair] = useState("BND/CNY");
  const [amount, setAmount] = useState(45000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/fx-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount_home: amount,
            pair,
            shock_pct: shock,
          }),
        });
        setResult(await res.json());
      } catch (e) {
        setResult({ error: "Could not reach Kai's backend" });
      }
      setLoading(false);
    }
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [shock, pair, amount]);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">FX Risk Simulator</h1>
        <p className="text-sm text-gray-500">
          See how currency moves affect your tuition cost
        </p>
      </div>

      <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 space-y-5">
        <div>
          <label className="text-sm text-gray-400">Currency pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="BND/CNY">BND / CNY</option>
            <option value="MYR/GBP">MYR / GBP</option>
            <option value="CNY/CNY">CNY / CNY</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">
            Tuition amount (home currency): {amount.toLocaleString()}
          </label>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">
            FX shock: {shock > 0 ? "+" : ""}{shock}%
          </label>
          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={shock}
            onChange={(e) => setShock(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
      </div>

      {loading && <p className="text-gray-500 text-sm">Calculating…</p>}

      {result && !result.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
            <p className="text-xs uppercase text-gray-500">Base cost</p>
            <p className="text-2xl font-bold text-white mt-1">
              {result.base_cost_dest?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              rate {result.base_rate}
            </p>
          </div>

          <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
            <p className="text-xs uppercase text-gray-500">Shocked cost</p>
            <p className="text-2xl font-bold text-white mt-1">
              {result.shocked_cost_dest?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              rate {result.shocked_rate}
            </p>
          </div>

          <div className="border border-yellow-800 rounded-xl p-5 bg-yellow-900/20 md:col-span-2">
            <p className="text-xs uppercase text-yellow-500">Extra cost</p>
            <p className="text-2xl font-bold text-yellow-300 mt-1">
              {result.extra_cost > 0 ? "+" : ""}
              {result.extra_cost?.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-200 mt-2">
              Recommended buffer: {result.recommended_buffer_pct}%
            </p>
          </div>
        </div>
      )}

      {result?.error && (
        <p className="text-red-400 text-sm">{result.error}</p>
      )}
    </main>
  );
}