"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, List, Box, Search } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { FragranceDetailSheet } from "@/components/collection/FragranceDetailSheet";
import { AddFragranceModal } from "@/components/collection/AddFragranceModal";
import { NoteTag } from "@/components/shared/NoteTag";
import { parseJson } from "@/lib/utils";

// SSR=false for Three.js
const CollectionScene = dynamic(
  () => import("@/components/collection/CollectionScene").then((m) => m.CollectionScene),
  { ssr: false, loading: () => (
    <div className="w-full flex items-center justify-center" style={{ height: "60vh" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>Loading 3D view...</p>
      </div>
    </div>
  )}
);

const ACCORD_FILTERS = ["all", "woody", "floral", "citrus", "oriental", "fresh", "gourmand", "spicy"];

export default function CollectionPage() {
  const { fragrances, loading, selectedId, setSelected, deleteFragrance } = useCollection();
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"3d" | "list">("3d");
  const [filter, setFilter] = useState("all");

  const owned = fragrances.filter((f) => f.owned);
  const wishlist = fragrances.filter((f) => !f.owned);
  const selectedFragrance = fragrances.find((f) => f.id === selectedId) ?? null;

  const filtered = owned.filter((f) => {
    if (filter === "all") return true;
    const accords = parseJson<string[]>(f.accords, []);
    return accords.some((a) => a.toLowerCase().includes(filter));
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold tracking-tight">
            My <span className="gradient-text">Collection</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "3d" ? "list" : "3d")}
              className="p-2.5 rounded-xl"
              style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}
            >
              {view === "3d" ? <List size={18} /> : <Box size={18} />}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "var(--accent)", color: "#09090b" }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          {owned.length} owned · {wishlist.length} on wishlist
        </p>
      </div>

      {/* Accord filter chips — inspired by Corner's category pills */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {ACCORD_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? "var(--accent)" : "var(--surface-2)",
              color: filter === f ? "#09090b" : "var(--foreground-muted)",
              border: `1px solid ${filter === f ? "transparent" : "var(--border)"}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {view === "3d" ? (
        /* 3D Scene */
        <CollectionScene
          fragrances={filtered}
          selectedId={selectedId}
          onSelect={(id) => setSelected(selectedId === id ? null : id)}
        />
      ) : (
        /* List view */
        <div className="px-5 space-y-3 fade-up">
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "var(--foreground-muted)" }}>
              <Box size={40} className="mx-auto mb-3 opacity-30" />
              <p>No fragrances yet</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-sm" style={{ color: "var(--accent)" }}>
                Add your first fragrance
              </button>
            </div>
          )}
          {filtered.map((f) => {
            const accords = parseJson<string[]>(f.accords, []);
            return (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: selectedId === f.id ? "var(--surface-3)" : "var(--surface-2)",
                  border: `1px solid ${selectedId === f.id ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                  style={{ background: "var(--surface-3)", color: "var(--accent)" }}
                >
                  {f.brand[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{f.name}</p>
                  <p className="text-sm truncate" style={{ color: "var(--foreground-muted)" }}>
                    {f.brand}{f.concentration ? ` · ${f.concentration}` : ""}
                  </p>
                  {accords.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {accords.slice(0, 2).map((a) => (
                        <NoteTag key={a} name={a} family={a} />
                      ))}
                    </div>
                  )}
                </div>
                {f.rating && (
                  <span className="text-sm font-bold" style={{ color: "#fbbf24" }}>{f.rating}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Wishlist section */}
      {wishlist.length > 0 && (
        <div className="px-5 mt-6 mb-4">
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--foreground-muted)" }}>Wishlist</h2>
          <div className="space-y-2">
            {wishlist.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(201,169,110,0.1)", color: "var(--accent)" }}>
                  {f.brand[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{f.brand}</p>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-3)", color: "var(--foreground-subtle)" }}>
                  Wishlist
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <FragranceDetailSheet
        fragrance={selectedFragrance}
        onClose={() => setSelected(null)}
        onDelete={deleteFragrance}
      />

      {/* Add Modal */}
      {showAdd && <AddFragranceModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
