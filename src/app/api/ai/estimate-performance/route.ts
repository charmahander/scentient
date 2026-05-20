import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

interface Performance {
  sillage: number;
  projection: number;
  longevity: number;
}

const HEAVY = ["amber", "oud", "leather", "resinous", "oriental", "gourmand", "smoky", "animalic", "spicy", "woody", "tobacco"];
const LIGHT = ["citrus", "aquatic", "fresh", "green", "aromatic", "musky", "powdery"];

const CONCENTRATION_BASE: Record<string, Performance> = {
  Parfum: { sillage: 4, projection: 4, longevity: 10 },
  EDP: { sillage: 3.5, projection: 3.5, longevity: 8 },
  EDT: { sillage: 2.5, projection: 2.5, longevity: 5 },
  EDC: { sillage: 2, projection: 2, longevity: 3 },
  Cologne: { sillage: 1.5, projection: 1.5, longevity: 2.5 },
};

function clamp5(n: number): number {
  return Math.max(0.5, Math.min(5, Math.round(n * 2) / 2));
}

function ruleBasedEstimate(concentration: string | undefined, accords: string[]): Performance {
  const base = CONCENTRATION_BASE[concentration ?? ""] ?? { sillage: 3, projection: 3, longevity: 6 };
  const lower = accords.map((a) => a.toLowerCase());
  let nudge = 0;
  for (const a of lower) {
    if (HEAVY.some((h) => a.includes(h))) nudge += 0.4;
    if (LIGHT.some((l) => a.includes(l))) nudge -= 0.3;
  }
  return {
    sillage: clamp5(base.sillage + nudge),
    projection: clamp5(base.projection + nudge),
    longevity: Math.max(1, Math.min(16, Math.round(base.longevity + nudge * 2))),
  };
}

export async function POST(req: NextRequest) {
  const { name, brand, concentration, accords = [], notes = [] } = await req.json();
  const accordList: string[] = Array.isArray(accords) ? accords : [];

  const fallback = ruleBasedEstimate(concentration, accordList);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ...fallback, source: "estimate" });
  }

  try {
    const noteList = Array.isArray(notes)
      ? notes.map((n: { name?: string } | string) => (typeof n === "string" ? n : n.name)).filter(Boolean).join(", ")
      : "";
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system:
        "You are a perfumery expert estimating a fragrance's performance. Respond with ONLY a JSON object, no prose. Scales: sillage 0-5 (trail left behind), projection 0-5 (how far it radiates), longevity in hours (1-16).",
      messages: [
        {
          role: "user",
          content: `Estimate performance for ${brand ?? ""} ${name ?? ""}${concentration ? ` (${concentration})` : ""}.${accordList.length ? ` Accords: ${accordList.join(", ")}.` : ""}${noteList ? ` Notes: ${noteList}.` : ""}\nReturn JSON: {"sillage": number, "projection": number, "longevity": number}`,
        },
      ],
    });

    const block = msg.content.find((c) => c.type === "text");
    const text = block && block.type === "text" ? block.text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        sillage: clamp5(Number(parsed.sillage) || fallback.sillage),
        projection: clamp5(Number(parsed.projection) || fallback.projection),
        longevity: Math.max(1, Math.min(16, Math.round(Number(parsed.longevity) || fallback.longevity))),
        source: "ai",
      });
    }
  } catch (e) {
    console.error("estimate-performance AI failed", e);
  }

  return NextResponse.json({ ...fallback, source: "estimate" });
}
