import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lon = parseFloat(searchParams.get("lon") ?? "0");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const weather = await getWeather(lat, lon);
  if (!weather) {
    return NextResponse.json(
      { error: "Weather unavailable. Add OPENWEATHERMAP_API_KEY to .env" },
      { status: 503 }
    );
  }

  return NextResponse.json(weather);
}
