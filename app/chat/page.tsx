"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "kai";
  text: string;
  ts: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
  setSessionId(crypto.randomUUID());
}, []);

async function send() {
  const trimmed = input.trim();
  if (!trimmed || sending || !sessionId) return;

    const userMsg: Message = {
      role: "user",
      text: trimmed,
      ts: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ message: trimmed, user_id: 1, session_id: sessionId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "kai",
          text: data.reply,
          ts: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (e: any) {
      setError(`Could not reach Kai: ${e.message}`);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const suggestions = [
    "How much does Aiman have?",
    "What if BND/CNY rises 5%?",
    "Transfer 2000 from Aiman to China Univ X",
    "Build a plan for Aiman: income 1500, savings 8000, tuition 45000, 36 months, living 1200",
  ];

  return (
    <main className="max-w-3xl mx-auto p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Talk to Kai</h1>
        <p className="text-sm text-gray-500">
          Your cross-border financial agent · sandbox mode
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm space-y-2">
            <p>Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700"
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
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-cyan-900/40 text-cyan-100 border border-cyan-800"
                  : "bg-gray-900 text-gray-100 border border-gray-700"
              }`}
            >
              <div className="text-xs opacity-60 mb-1">
                {m.role === "user" ? "you" : "Kai"} · {m.ts}
              </div>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-gray-400 text-sm">
              <span className="inline-flex gap-1">
                Kai is thinking
                <span className="animate-pulse">.</span>
                <span className="animate-pulse">.</span>
                <span className="animate-pulse">.</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm border border-red-800 rounded p-3">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Kai anything… (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-600"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="px-5 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold"
        >
          Send
        </button>
      </div>
    </main>
  );
}