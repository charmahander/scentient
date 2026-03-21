"use client";

import { useMemo } from "react";
import { useCollection } from "@/hooks/useCollection";
import { parseJson, getAccordColor, NOTE_FAMILIES } from "@/lib/utils";
import { NoteTag } from "@/components/shared/NoteTag";
import { Fragrance } from "@/types";

function AccordWheel({ fragrances }: { fragrances: Fragrance[] }) {
  const accordData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of fragrances) {
      const accords = parseJson<string[]>(f.accords, []);
      for (const a of accords) {
        const key = a.toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: getAccordColor(name),
      }));
  }, [fragrances]);

  if (accordData.length === 0) return (
    <div className="text-center py-8" style={{ color: "var(--foreground-muted)" }}>
      <p className="text-sm">Add fragrances to see your accord profile</p>
    </div>
  );

  // SVG donut chart
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const innerR = 44;
  let cumAngle = -Math.PI / 2;
  const total = accordData.reduce((a, b) => a + b.count, 0);

  const slices = accordData.map((d) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const ix1 = cx + innerR * Math.cos(cumAngle);
    const iy1 = cy + innerR * Math.sin(cumAngle);
    const ix2 = cx + innerR * Math.cos(cumAngle + angle);
    const iy2 = cy + innerR * Math.sin(cumAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    cumAngle += angle;
    return { ...d, path };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.85} stroke="#09090b" strokeWidth={1.5} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
          {accordData.length}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
          accord types
        </text>
      </svg>
      <div className="w-full space-y-2 mt-2">
        {accordData.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-sm capitalize flex-1 font-medium">{d.name}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
              <div className="h-full rounded-full" style={{ width: `${d.percentage}%`, background: d.color }} />
            </div>
            <span className="text-xs w-8 text-right" style={{ color: "var(--foreground-subtle)" }}>{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GapAnalysis({ fragrances }: { fragrances: Fragrance[] }) {
  const { present, missing } = useMemo(() => {
    const presentFamilies = new Set<string>();
    for (const f of fragrances) {
      const accords = parseJson<string[]>(f.accords, []);
      for (const a of accords) {
        const match = NOTE_FAMILIES.find((fam) => a.toLowerCase().includes(fam));
        if (match) presentFamilies.add(match);
      }
      if (f.fragranceNotes) {
        for (const fn of f.fragranceNotes) {
          presentFamilies.add(fn.note.family);
        }
      }
    }
    return {
      present: Array.from(presentFamilies),
      missing: NOTE_FAMILIES.filter((f) => !presentFamilies.has(f)),
    };
  }, [fragrances]);

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--foreground-subtle)" }}>
          In your collection
        </p>
        <div className="flex flex-wrap gap-1.5">
          {present.map((f) => (
            <NoteTag key={f} name={f} family={f} size="md" />
          ))}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--foreground-subtle)" }}>
            Unexplored territories
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
            These note families aren't in your collection yet — a great way to diversify.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                style={{ background: "var(--surface-3)", color: "var(--foreground-subtle)", border: "1px dashed var(--border)" }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoteDistribution({ fragrances }: { fragrances: Fragrance[] }) {
  const noteData = useMemo(() => {
    const counts: Record<string, { count: number; family: string }> = {};
    for (const f of fragrances) {
      for (const fn of f.fragranceNotes ?? []) {
        const name = fn.note.name;
        counts[name] = { count: (counts[name]?.count ?? 0) + 1, family: fn.note.family };
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12)
      .map(([name, { count, family }]) => ({ name, count, family }));
  }, [fragrances]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {noteData.map((n) => (
        <div
          key={n.name}
          className="flex items-center gap-1.5"
          style={{ transform: `scale(${0.85 + n.count * 0.1})`, transformOrigin: "center" }}
        >
          <NoteTag name={n.name} family={n.family} size="md" />
        </div>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { fragrances } = useCollection();
  const owned = fragrances.filter((f) => f.owned);

  return (
    <div className="px-5 pt-12 pb-4" style={{ background: "var(--background)", minHeight: "100vh" }}>
      <h1 className="text-3xl font-bold tracking-tight mb-1">
        <span className="gradient-text">Explore</span> Your Profile
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
        Understand your scent DNA and find what's missing
      </p>

      {/* Accord Wheel */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4">Accord Distribution</h2>
        <div className="p-5 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <AccordWheel fragrances={owned} />
        </div>
      </section>

      {/* Note Cloud */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4">Most Used Notes</h2>
        <div className="p-5 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          {owned.length > 0 ? <NoteDistribution fragrances={owned} /> : (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Add fragrances to see note distribution</p>
          )}
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4">Collection Gaps</h2>
        <GapAnalysis fragrances={owned} />
      </section>

      {/* Collection stats */}
      <section>
        <h2 className="text-base font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Owned", value: owned.length },
            { label: "Wishlist", value: fragrances.filter((f) => !f.owned).length },
            { label: "Avg Rating", value: owned.filter((f) => f.rating).length > 0 ? (owned.filter((f) => f.rating).reduce((a, f) => a + (f.rating ?? 0), 0) / owned.filter((f) => f.rating).length).toFixed(1) : "—" },
            { label: "Brands", value: new Set(owned.map((f) => f.brand)).size },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
