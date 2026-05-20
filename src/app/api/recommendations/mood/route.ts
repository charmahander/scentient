import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeather } from "@/lib/weather";
import { getMoodRecommendations } from "@/lib/recommendations/mood-engine";
import { anthropic } from "@/lib/anthropic";
import { parseJson } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { mood, occasion, lat, lon } = await req.json();
    if (!mood) {
      return NextResponse.json({ error: "mood is required" }, { status: 400 });
    }

    const fragrances = await prisma.fragrance.findMany({
      where: { owned: true },
      include: { fragranceNotes: { include: { note: true } } },
    });

    const parsed = fragrances.map((f) => ({
      ...f,
      season: parseJson<string[]>(f.season, []),
      timeOfDay: parseJson<string[]>(f.timeOfDay, []),
      occasion: parseJson<string[]>(f.occasion, []),
      accords: parseJson<string[]>(f.accords, []),
    }));

    let weather = null;
    if (lat && lon) {
      weather = await getWeather(parseFloat(lat), parseFloat(lon));
    }

    const recommendations = getMoodRecommendations(parsed as never, { mood, occasion, weather });

    // Optionally upgrade the top pick's reasoning with a concise AI sentence.
    if (process.env.ANTHROPIC_API_KEY && recommendations.length > 0) {
      try {
        const top = recommendations[0];
        const msg = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 90,
          system:
            "You are a concise fragrance advisor. Reply with ONE short sentence (max 25 words), no preamble.",
          messages: [
            {
              role: "user",
              content: `Why is ${top.fragrance.brand} ${top.fragrance.name} a great pick for a "${mood}" mood${occasion ? ` and a ${occasion} occasion` : ""}${weather ? ` in ${weather.temp}°F ${weather.description}` : ""}? Accords: ${(top.fragrance.accords as unknown as string[]).join(", ")}.`,
            },
          ],
        });
        const text = msg.content.find((c) => c.type === "text");
        if (text && text.type === "text" && text.text.trim()) {
          recommendations[0] = { ...top, reasoning: text.text.trim() };
        }
      } catch (e) {
        console.error("mood AI reasoning failed", e);
      }
    }

    return NextResponse.json({ recommendations, weather });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
