import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function AuditData() {
  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("ts", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="text-red-400 border border-red-800 rounded p-4">
        Error: {error.message}
      </div>
    );
  }

  if (!logs?.length) {
    return <p className="text-gray-500">Waiting for Kai activity...</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log: any) => (
        <div
          key={log.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-900"
        >
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400 font-mono">{log.actor}</span>
            <span className="text-gray-500">
              {new Date(log.ts).toLocaleTimeString()}
            </span>
          </div>
          <div
            className={`font-semibold mt-1 ${
              log.action.includes("risk")
                ? "text-yellow-400"
                : log.action.includes("executed")
                ? "text-green-400"
                : "text-white"
            }`}
          >
            {log.action}
          </div>
          <pre className="text-xs text-gray-400 mt-2 overflow-auto">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
          {log.reasoning && (
            <p className="text-sm text-gray-500 mt-2 italic">
              why: {log.reasoning}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AuditPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Kai · Live Audit Trail
      </h1>
      <Suspense fallback={<p className="text-gray-500">Loading audit log…</p>}>
        <AuditData />
      </Suspense>
    </main>
  );
}