import { NextRequest, NextResponse } from "next/server";
import { searchFragrantica, scrapeFragranceDetail } from "@/lib/fragrantica/scraper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const url = searchParams.get("url");

  if (url) {
    const detail = await scrapeFragranceDetail(url);
    return NextResponse.json(detail);
  }

  if (!q) {
    return NextResponse.json({ error: "q or url required" }, { status: 400 });
  }

  const results = await searchFragrantica(q);
  return NextResponse.json(results);
}
