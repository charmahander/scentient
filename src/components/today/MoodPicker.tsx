"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Loader2, RotateCcw } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { MOODS } from "@/lib/recommendations/mood-engine";
import { OCCASIONS } from "@/lib/utils";
import { DailyRecommendation } from "@/types";
import { NoteTag } from "@/components/shared/NoteTag";
import { parseJson } from "@/lib/utils";

const MOOD_LABELS: Record<string, string> = {
  confident: "Confident",
  fresh: "Fresh",
  cozy: "Cozy",
  romantic: "Romantic",
  energetic: "Energetic",
  professional: "Professional",
  bold: "Bold",
  relaxed: "Relaxed",
};

function PickCard({ rec, top }: { rec: DailyRecommendation; top: boolean }) {
  const { fragrance, score, reasoning } = rec;
  const accords = parseJson<string[]>(fragrance.accords, []);
  return (
    <div
      className="p-4 rounded-2xl relative overflow-hidden"
      style={{
        background: top
          ? "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))"
          : "var(--surface-2)",
        border: `1px solid ${top ? "rgba(201,169,110,0.3)" : "var(--border)"}`,
      }}
    >
      {top && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#09090b" }}
        >
          <Sparkles size={10} /> Top Pick
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
          style={{ background: "var(--surface-3)", color: "var(--accent)" }}
        >
          {fragrance.brand[0]}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <p className="font-bold text-base leading-tight">{fragrance.name}</p>
          <p className="text-sm" style={{ color: "var(--accent)" }}>{fragrance.brand}</p>
          {fragrance.rating != null && (
            <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#fbbf24" }}>
              <Star size={10} fill="currentColor" /> {fragrance.rating.toFixed(1)}
            </p>
          )}
        </div>
      </div>
      {accords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {accords.slice(0, 3).map((a) => (
            <NoteTag key={a} name={a} family={a} />
          ))}
        </div>
      )}
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
        {reasoning}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${score}%`, background: top ? "var(--accent)" : "var(--foreground-subtle)" }}
          />
        </div>
        <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{score}% match</span>
      </div>
    </div>
  );
}

export function MoodPicker({ ownedCount }: { ownedCount: number }) {
  const { coords } = useWeather();
  const [mood, setMood] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [recs, setRecs] = useState<DailyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async (m: string, o: string | null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: m, occasion: o ?? undefined, lat: coords?.lat, lon: coords?.lon }),
      });
      const data = await res.json();
      setRecs(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  const selectMood = (m: string) => {
    setMood(m);
    run(m, occasion);
  };

  const selectOccasion = (o: string) => {
    const next = occasion === o ? null : o;
    setOccasion(next);
    if (mood) run(mood, next);
  };

  const reset = () => {
    setMood(null);
    setOccasion(null);
    setRecs([]);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">What&apos;s your vibe?</h2>
        {mood && (
          <button onClick={reset} className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-subtle)" }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Mood chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => selectMood(m)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background: mood === m ? "var(--accent)" : "var(--surface-3)",
              color: mood === m ? "#09090b" : "var(--foreground-muted)",
            }}
          >
            {MOOD_LABELS[m] ?? m}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {mood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Occasion row */}
            <div className="flex flex-wrap gap-2 mt-3">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => selectOccasion(o)}
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize transition-all"
                  style={{
                    background: occasion === o ? "var(--accent-glow)" : "var(--surface-2)",
                    color: occasion === o ? "var(--accent)" : "var(--foreground-subtle)",
                    border: `1px solid ${occasion === o ? "rgba(201,169,110,0.3)" : "var(--border)"}`,
                  }}
                >
                  {o}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="mt-4 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 py-6 justify-center" style={{ color: "var(--foreground-muted)" }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Finding your match...</span>
                </div>
              )}
              {!loading && ownedCount === 0 && (
                <p className="text-sm text-center py-6" style={{ color: "var(--foreground-muted)" }}>
                  Add fragrances to your collection to get mood-based picks.
                </p>
              )}
              {!loading &&
                recs.map((rec, i) => <PickCard key={rec.fragrance.id} rec={rec} top={i === 0} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
