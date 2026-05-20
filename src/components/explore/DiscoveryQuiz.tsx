"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Check, Plus, RotateCcw } from "lucide-react";
import { QUIZ_QUESTIONS, QuizAnswers, Direction } from "@/lib/recommendations/discovery";
import { useCollection } from "@/hooks/useCollection";
import { NoteTag } from "@/components/shared/NoteTag";

interface Suggestion {
  name: string;
  brand: string;
  why: string;
  accords: string[];
}

interface Results {
  directions: Direction[];
  suggestions: Suggestion[];
  aiEnabled: boolean;
}

export function DiscoveryQuiz({ onClose }: { onClose: () => void }) {
  const { addFragrance } = useCollection();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const total = QUIZ_QUESTIONS.length;
  const current = QUIZ_QUESTIONS[step];

  const choose = async (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      await submit(next);
    }
  };

  const submit = async (finalAnswers: QuizAnswers) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      setResults({
        directions: data.directions ?? [],
        suggestions: data.suggestions ?? [],
        aiEnabled: !!data.aiEnabled,
      });
    } catch {
      setResults({ directions: [], suggestions: [], aiEnabled: false });
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
    setAdded(new Set());
  };

  const addToWishlist = async (s: Suggestion) => {
    const key = `${s.brand}-${s.name}`;
    const created = await addFragrance({
      name: s.name,
      brand: s.brand,
      accords: s.accords,
      description: s.why,
      owned: false,
    });
    if (created) setAdded((prev) => new Set(prev).add(key));
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bottom-sheet overflow-y-auto"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          maxHeight: "88vh",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={18} style={{ color: "var(--accent)" }} /> Discover
            </h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ background: "var(--surface-3)" }}>
              <X size={16} style={{ color: "var(--foreground-muted)" }} />
            </button>
          </div>

          {/* Quiz */}
          {!results && !loading && (
            <div>
              {/* Progress */}
              <div className="flex gap-1.5 mb-5">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full"
                    style={{ background: i <= step ? "var(--accent)" : "var(--surface-3)" }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--foreground-subtle)" }}>
                    Question {step + 1} of {total}
                  </p>
                  <h3 className="text-lg font-bold mb-4">{current.question}</h3>
                  <div className="space-y-2">
                    {current.options.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => choose(o.value)}
                        className="w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all"
                        style={{
                          background: answers[current.id] === o.value ? "var(--accent)" : "var(--surface-2)",
                          color: answers[current.id] === o.value ? "#09090b" : "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {step > 0 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="mt-4 text-xs"
                      style={{ color: "var(--foreground-subtle)" }}
                    >
                      ← Back
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: "var(--foreground-muted)" }}>
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
              <span className="text-sm">Reading your scent DNA...</span>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div>
              <section className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-subtle)" }}>
                  Directions to explore
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {results.directions.map((d) => (
                    <NoteTag key={d.family} name={d.family} family={d.family} size="md" />
                  ))}
                </div>
                {results.directions[0] && (
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {results.directions[0].rationale}
                  </p>
                )}
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-subtle)" }}>
                  Bottles to try
                </p>
                {results.suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {results.suggestions.map((s) => {
                      const key = `${s.brand}-${s.name}`;
                      const isAdded = added.has(key);
                      return (
                        <div
                          key={key}
                          className="p-3 rounded-2xl"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{s.name}</p>
                              <p className="text-xs" style={{ color: "var(--accent)" }}>{s.brand}</p>
                            </div>
                            <button
                              onClick={() => addToWishlist(s)}
                              disabled={isAdded}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                              style={{
                                background: isAdded ? "var(--surface-3)" : "var(--accent)",
                                color: isAdded ? "var(--foreground-subtle)" : "#09090b",
                              }}
                            >
                              {isAdded ? <Check size={12} /> : <Plus size={12} />}
                              {isAdded ? "Added" : "Wishlist"}
                            </button>
                          </div>
                          {s.why && (
                            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                              {s.why}
                            </p>
                          )}
                          {s.accords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {s.accords.slice(0, 4).map((a) => (
                                <NoteTag key={a} name={a} family={a} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl text-sm" style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}>
                    {results.aiEnabled
                      ? "Couldn't generate specific picks right now — explore the directions above."
                      : "Connect an AI key (ANTHROPIC_API_KEY) to unlock specific bottle recommendations. Your directions above are ready to explore."}
                  </div>
                )}
              </section>

              <button
                onClick={restart}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "var(--surface-3)", color: "var(--foreground-muted)" }}
              >
                <RotateCcw size={14} /> Retake quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
