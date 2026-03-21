"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const VIBES = [
  { label: "Cozy evening in", emoji: "🕯️" },
  { label: "First date", emoji: "🌹" },
  { label: "Fresh morning run", emoji: "🌅" },
  { label: "Office power move", emoji: "💼" },
  { label: "Beach vacation", emoji: "🏖️" },
  { label: "Rainy day at home", emoji: "🌧️" },
  { label: "Night out clubbing", emoji: "🎉" },
  { label: "What's missing from my collection?", emoji: "🔍" },
];

export default function ChatPage() {
  const { weather } = useWeather();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your fragrance advisor. Tell me the vibe you're going for, an occasion, or ask me anything about your collection — I'll give you personalized recommendations based on what you own.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const aiId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          weather,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: err.error || "Something went wrong. Check your API key." }
              : m
          )
        );
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: "Failed to connect. Please try again." } : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}>
            <Sparkles size={15} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-xl font-bold">Fragrance Advisor</h1>
        </div>
        <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
          AI-powered · knows your collection{weather ? ` · ${weather.temp}°F in ${weather.city}` : ""}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full shrink-0 mr-2 mt-1 flex items-center justify-center" style={{ background: "var(--accent-glow)", border: "1px solid rgba(201,169,110,0.3)" }}>
                <Sparkles size={12} style={{ color: "var(--accent)" }} />
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.role === "user" ? "var(--accent)" : "var(--surface-2)",
                color: msg.role === "user" ? "#09090b" : "var(--foreground)",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              }}
            >
              {msg.content || (
                <span className="flex items-center gap-1" style={{ color: "var(--foreground-subtle)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-current" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-current" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-current" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Vibe chips — inspired by Corner's "cozy → vibe search" */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs mb-2 font-semibold uppercase tracking-widest" style={{ color: "var(--foreground-subtle)" }}>
            Vibe search
          </p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button
                key={v.label}
                onClick={() => sendMessage(v.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass transition-all"
                style={{ color: "var(--foreground-muted)" }}
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2 items-end"
        style={{
          borderTop: "1px solid var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0px)",
          background: "var(--surface)",
        }}
      >
        <div
          className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about your collection..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
          style={{
            background: streaming || !input.trim() ? "var(--surface-3)" : "var(--accent)",
            color: streaming || !input.trim() ? "var(--foreground-subtle)" : "#09090b",
          }}
        >
          {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
