import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link href="/dashboard" className="text-cyan-400 font-bold">
          KampusPay
        </Link>
        <Link href="/chat" className="text-sm text-gray-400 hover:text-white">
          Chat
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
          Dashboard
        </Link>
        <Link href="/transactions" className="text-sm text-gray-400 hover:text-white">
          Transactions
        </Link>
        <Link href="/simulator" className="text-sm text-gray-400 hover:text-white">
          FX Simulator
        </Link>
        <Link href="/audit" className="text-sm text-gray-400 hover:text-white">
          Audit
        </Link>
      </div>
    </nav>
  );
}