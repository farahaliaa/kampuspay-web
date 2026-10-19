"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "kai"; text: string; ts: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending || !sessionId) return;

    setMessages((p) => [
      ...p,
      { role: "user", text: trimmed, ts: new Date().toLocaleTimeString() },
    ]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          user_id: 1,
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          role: "kai",
          text: data.reply,
          ts: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "kai",
          text: "Connection error. Check that the backend is running.",
          ts: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const suggestions = [
    "How much does Aiman have?",
    "What if BND/CNY rises 5%?",
    "Transfer 2000 from Aiman to China Univ X",
    "Build a plan for Aiman: income 1500, savings 8000, tuition 45000, 36 months, living 1200",
  ];

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-blue-400" size={22} /> Talk to Kai
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your cross-border financial agent · sandbox mode
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {messages.length === 0 && (
          <div className="text-slate-500 space-y-3">
            <p className="text-sm">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
          >
            {m.role === "kai" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                K
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-100"
              }`}
            >
              <div className="text-xs opacity-60 mb-1">
                {m.role === "user" ? "You" : "Kai"} · {m.ts}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              K
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-slate-400 text-sm">
              Kai is thinking
              <span className="animate-pulse">.</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse">.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="flex gap-2 items-end bg-slate-900 border border-slate-800 rounded-2xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask Kai anything…"
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 text-white placeholder-slate-500 resize-none focus:outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}