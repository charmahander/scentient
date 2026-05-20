import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { scoreDirections, QUIZ_QUESTIONS, QuizAnswers } from "@/lib/recommendations/discovery";
import { buildSystemPrompt } from "@/lib/recommendations/ai-prompts";
import { parseJson } from "@/lib/utils";

interface Suggestion {
  name: string;
  brand: string;
  why: string;
  accords: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { answers } = (await req.json()) as { answers: QuizAnswers };

    const fragrances = await prisma.fragrance.findMany({
      include: { fragranceNotes: { include: { note: true } } },
    });

    const parsed = fragrances.map((f) => ({
      ...f,
      season: parseJson<string[]>(f.season, []),
      timeOfDay: parseJson<string[]>(f.timeOfDay, []),
      occasion: parseJson<string[]>(f.occasion, []),
      accords: parseJson<string[]>(f.accords, []),
    }));

    const owned = parsed.filter((f) => f.owned);
    const directions = scoreDirections(answers ?? {}, owned as never);

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ directions, suggestions: [], aiEnabled: false });
    }

    // Build a readable summary of the user's answers for the model.
    const answerSummary = QUIZ_QUESTIONS.map((q) => {
      const opt = q.options.find((o) => o.value === answers?.[q.id]);
      return opt ? `${q.question} -> ${opt.label}` : null;
    })
      .filter(Boolean)
      .join("\n");

    let suggestions: Suggestion[] = [];
    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system:
          buildSystemPrompt(parsed as never, null) +
          "\n\nYou are recommending NEW fragrances the user does NOT already own. Avoid anything in their collection or wishlist. Respond with ONLY a JSON array, no prose.",
        messages: [
          {
            role: "user",
            content: `Based on this discovery quiz:\n${answerSummary}\n\nAnd these directions to explore: ${directions.map((d) => d.family).join(", ")}.\n\nRecommend 4 specific real fragrances to explore next. Return JSON array: [{"name": string, "brand": string, "why": string (one sentence), "accords": string[]}]`,
          },
        ],
      });
      const text = msg.content.find((c) => c.type === "text");
      const raw = text && text.type === "text" ? text.text : "";
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) {
          suggestions = arr
            .filter((s) => s && s.name && s.brand)
            .slice(0, 6)
            .map((s) => ({
              name: String(s.name),
              brand: String(s.brand),
              why: String(s.why ?? ""),
              accords: Array.isArray(s.accords) ? s.accords.map(String) : [],
            }));
        }
      }
    } catch (e) {
      console.error("discover AI failed", e);
    }

    return NextResponse.json({ directions, suggestions, aiEnabled: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
