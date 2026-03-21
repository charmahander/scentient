import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeather } from "@/lib/weather";
import { getWeatherRecommendations } from "@/lib/recommendations/weather-engine";
import { parseJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lon = parseFloat(searchParams.get("lon") ?? "0");

  try {
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

    if (!lat || !lon) {
      // Return random top-rated fragrances without weather
      const sorted = [...parsed].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      return NextResponse.json({
        recommendations: sorted.slice(0, 3).map((f, i) => ({
          fragrance: f,
          score: 80 - i * 10,
          reasoning: "Top-rated in your collection",
          weatherMatch: [],
        })),
        weather: null,
      });
    }

    const weather = await getWeather(lat, lon);
    const recommendations = getWeatherRecommendations(parsed as never, weather!);

    return NextResponse.json({ recommendations, weather });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
