"use client";

import { useState } from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";
import { FragranticaSearchResult } from "@/types";
import { CONCENTRATIONS, SEASONS, OCCASIONS, BOTTLE_SHAPES } from "@/lib/utils";
import { useCollectionStore } from "@/store/collection";

interface AddFragranceModalProps {
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "", brand: "", year: "", concentration: "", description: "",
  accords: "", season: [] as string[], occasion: [] as string[],
  rating: "", bottleVolume: "", bottleShape: "tall", purchasePrice: "",
  owned: true, imageUrl: "", fragranticaUrl: "",
};

export function AddFragranceModal({ onClose }: AddFragranceModalProps) {
  const { addFragrance } = useCollectionStore();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FragranticaSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"search" | "manual">("search");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/scrape/fragrantica?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = async (result: FragranticaSearchResult) => {
    if (result.fragranticaUrl) {
      setSearching(true);
      try {
        const res = await fetch(`/api/scrape/fragrantica?url=${encodeURIComponent(result.fragranticaUrl)}`);
        const detail = await res.json();
        setForm((f) => ({
          ...f,
          name: detail.name || result.name,
          brand: detail.brand || result.brand,
          year: detail.year?.toString() || "",
          description: detail.description || "",
          imageUrl: detail.imageUrl || "",
          fragranticaUrl: result.fragranticaUrl || "",
          accords: (detail.accords || []).join(", "),
        }));
      } catch {
        setForm((f) => ({ ...f, name: result.name, brand: result.brand }));
      } finally {
        setSearching(false);
      }
    } else {
      setForm((f) => ({ ...f, name: result.name, brand: result.brand }));
    }
    setTab("manual");
    setSearchResults([]);
  };

  const toggleArray = (field: "season" | "occasion", val: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.brand) return;
    setSaving(true);
    const accordArr = form.accords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await addFragrance({
      ...form,
      year: form.year ? parseInt(form.year) : undefined,
      rating: form.rating ? parseFloat(form.rating) : undefined,
      bottleVolume: form.bottleVolume ? parseFloat(form.bottleVolume) : undefined,
      purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
      accords: accordArr,
    });
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bottom-sheet overflow-y-auto"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          maxHeight: "92vh",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Add Fragrance</h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ background: "var(--surface-3)" }}>
              <X size={16} style={{ color: "var(--foreground-muted)" }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "var(--surface-2)" }}>
            {(["search", "manual"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t ? "var(--accent)" : "transparent",
                  color: tab === t ? "#09090b" : "var(--foreground-muted)",
                }}
              >
                {t === "search" ? "Search Fragrantica" : "Manual Entry"}
              </button>
            ))}
          </div>

          {tab === "search" ? (
            <div>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <Search size={16} style={{ color: "var(--foreground-subtle)" }} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search fragrances..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--foreground)" }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--accent)", color: "#09090b" }}
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : "Go"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectResult(r)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--surface-3)", color: "var(--accent)" }}>
                          {r.brand[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{r.brand}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-8" style={{ color: "var(--foreground-muted)" }}>
                  <p className="text-sm">No results — try a different name</p>
                  <button
                    onClick={() => setTab("manual")}
                    className="mt-3 text-sm underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Add manually instead
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Fragrance Name *">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sauvage" />
              </Field>
              <Field label="Brand *">
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Dior" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year">
                  <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2015" type="number" />
                </Field>
                <Field label="Concentration">
                  <select value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })}>
                    <option value="">Select...</option>
                    {CONCENTRATIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Accords (comma-separated)">
                <input value={form.accords} onChange={(e) => setForm({ ...form, accords: e.target.value })} placeholder="woody, citrus, musky" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add notes about this fragrance..." rows={2} />
              </Field>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--foreground-subtle)" }}>Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArray("season", s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
                      style={{
                        background: form.season.includes(s) ? "var(--accent)" : "var(--surface-3)",
                        color: form.season.includes(s) ? "#09090b" : "var(--foreground-muted)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--foreground-subtle)" }}>Occasions</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      onClick={() => toggleArray("occasion", o)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
                      style={{
                        background: form.occasion.includes(o) ? "var(--accent)" : "var(--surface-3)",
                        color: form.occasion.includes(o) ? "#09090b" : "var(--foreground-muted)",
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bottle (ml)">
                  <input value={form.bottleVolume} onChange={(e) => setForm({ ...form, bottleVolume: e.target.value })} placeholder="100" type="number" />
                </Field>
                <Field label="Price ($)">
                  <input value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="120" type="number" />
                </Field>
              </div>
              <Field label="Bottle Shape">
                <select value={form.bottleShape} onChange={(e) => setForm({ ...form, bottleShape: e.target.value })}>
                  {BOTTLE_SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="My Rating (1-10)">
                <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="8.5" type="number" min="1" max="10" step="0.1" />
              </Field>

              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <span className="text-sm font-medium">Already own this?</span>
                <button
                  onClick={() => setForm({ ...form, owned: !form.owned })}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: form.owned ? "var(--accent)" : "var(--surface-3)" }}
                >
                  <span
                    className="absolute w-5 h-5 rounded-full top-0.5 transition-all"
                    style={{
                      background: "#fff",
                      left: form.owned ? "calc(100% - 22px)" : "2px",
                    }}
                  />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={saving || !form.name || !form.brand}
                className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
                style={{
                  background: saving || !form.name ? "var(--surface-3)" : "var(--accent)",
                  color: saving || !form.name ? "var(--foreground-subtle)" : "#09090b",
                }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {form.owned ? "Add to Collection" : "Add to Wishlist"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--foreground-subtle)" }}>
        {label}
      </p>
      <div
        className="[&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-sm [&_textarea]:w-full [&_textarea]:bg-transparent [&_textarea]:outline-none [&_textarea]:text-sm [&_textarea]:resize-none [&_select]:w-full [&_select]:bg-transparent [&_select]:outline-none [&_select]:text-sm px-3 py-3 rounded-xl"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        {children}
      </div>
    </div>
  );
}
