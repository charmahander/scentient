"use client";

import { useEffect } from "react";
import { X, Star, Droplets, Calendar, Heart, Trash2 } from "lucide-react";
import { Fragrance } from "@/types";
import { NoteTag } from "@/components/shared/NoteTag";
import { parseJson } from "@/lib/utils";

interface FragranceDetailSheetProps {
  fragrance: Fragrance | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const LAYER_LABELS = { top: "Top", heart: "Heart", base: "Base" } as const;

export function FragranceDetailSheet({ fragrance, onClose, onDelete }: FragranceDetailSheetProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!fragrance) return null;

  const accords = parseJson<string[]>(fragrance.accords, []);
  const seasons = parseJson<string[]>(fragrance.season, []);
  const occasions = parseJson<string[]>(fragrance.occasion, []);
  const notesByLayer = {
    top: fragrance.fragranceNotes?.filter((n) => n.layer === "top") ?? [],
    heart: fragrance.fragranceNotes?.filter((n) => n.layer === "heart") ?? [],
    base: fragrance.fragranceNotes?.filter((n) => n.layer === "base") ?? [],
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bottom-sheet overflow-y-auto"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          maxHeight: "80vh",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                {fragrance.brand}
              </p>
              <h2 className="text-2xl font-bold tracking-tight">{fragrance.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {fragrance.concentration && (
                  <span className="text-xs px-2 py-0.5 rounded-full glass" style={{ color: "var(--foreground-muted)" }}>
                    {fragrance.concentration}
                  </span>
                )}
                {fragrance.year && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-subtle)" }}>
                    <Calendar size={10} /> {fragrance.year}
                  </span>
                )}
                {fragrance.rating && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#fbbf24" }}>
                    <Star size={10} fill="currentColor" /> {fragrance.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ background: "var(--surface-3)", color: "var(--foreground-muted)" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          {fragrance.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              {fragrance.description}
            </p>
          )}

          {/* Accords */}
          {accords.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--foreground-subtle)" }}>
                Accords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {accords.map((a) => (
                  <NoteTag key={a} name={a} family={a} />
                ))}
              </div>
            </div>
          )}

          {/* Note pyramid */}
          {Object.entries(notesByLayer).some(([, notes]) => notes.length > 0) && (
            <div className="mb-4 p-4 rounded-2xl" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-subtle)" }}>
                Note Pyramid
              </p>
              {(["top", "heart", "base"] as const).map((layer) => {
                const notes = notesByLayer[layer];
                if (!notes.length) return null;
                return (
                  <div key={layer} className="mb-2 last:mb-0">
                    <p className="text-xs mb-1" style={{ color: "var(--foreground-subtle)" }}>
                      {LAYER_LABELS[layer]}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {notes.map((fn) => (
                        <NoteTag key={fn.id} name={fn.note.name} family={fn.note.family} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {seasons.length > 0 && (
              <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--foreground-subtle)" }}>Seasons</p>
                <p className="text-sm font-medium capitalize">{seasons.join(", ")}</p>
              </div>
            )}
            {occasions.length > 0 && (
              <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--foreground-subtle)" }}>Occasion</p>
                <p className="text-sm font-medium capitalize">{occasions.join(", ")}</p>
              </div>
            )}
            {fragrance.bottleVolume && (
              <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--foreground-subtle)" }}>Volume</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Droplets size={12} style={{ color: "var(--accent)" }} />
                  {fragrance.bottleVolume}ml
                </p>
              </div>
            )}
            {fragrance.purchasePrice && (
              <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--foreground-subtle)" }}>Paid</p>
                <p className="text-sm font-medium">${fragrance.purchasePrice}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {fragrance.fragranticaUrl && (
              <a
                href={fragrance.fragranticaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-center"
                style={{ background: "var(--surface-3)", color: "var(--foreground-muted)" }}
              >
                View on Fragrantica
              </a>
            )}
            <button
              onClick={() => { onDelete(fragrance.id); onClose(); }}
              className="p-3 rounded-xl"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
