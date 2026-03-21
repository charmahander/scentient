import { FragranticaSearchResult } from "@/types";

// NOTE: Fragrantica scraping may be subject to their ToS.
// This implementation is for personal use only and respects rate limits.

export async function searchFragrantica(query: string): Promise<FragranticaSearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.fragrantica.com/search/?query=${encoded}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    return parseSearchResults(html);
  } catch {
    return [];
  }
}

function parseSearchResults(html: string): FragranticaSearchResult[] {
  const results: FragranticaSearchResult[] = [];

  // Match perfume cards in search results
  const cardRegex = /<div[^>]*class="[^"]*cell[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  const nameRegex = /<p[^>]*><a[^>]*href="([^"]*perfume[^"]*)"[^>]*>([^<]+)<\/a><\/p>/;
  const brandRegex = /<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/;
  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/;

  // Simpler: grab all perfume links from search page
  const linkRegex = /href="(https:\/\/www\.fragrantica\.com\/perfume\/([^/]+)\/([^"]+)\.html)"/g;
  const seen = new Set<string>();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const [, fullUrl, brand, slug] = match;
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    if (results.length >= 8) break;

    const brandClean = brand.replace(/-/g, " ");
    const nameClean = slug
      .replace(/-/g, " ")
      .replace(/\d+$/, "")
      .trim();

    results.push({
      name: nameClean,
      brand: brandClean,
      fragranticaUrl: fullUrl,
    });
  }

  return results;
}

export async function scrapeFragranceDetail(url: string): Promise<Partial<FragranticaSearchResult>> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return {};
    const html = await res.text();
    return parseFragranceDetail(html, url);
  } catch {
    return {};
  }
}

function parseFragranceDetail(html: string, url: string): Partial<FragranticaSearchResult> {
  const result: Partial<FragranticaSearchResult> = { fragranticaUrl: url };

  // Extract name
  const nameMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/);
  if (nameMatch) result.name = nameMatch[1].trim();

  // Extract brand
  const brandMatch = html.match(/itemprop="brand"[^>]*>[^<]*<[^>]*>([^<]+)<\/span>/);
  if (brandMatch) result.brand = brandMatch[1].trim();

  // Extract year
  const yearMatch = html.match(/\((\d{4})\)/);
  if (yearMatch) result.year = parseInt(yearMatch[1]);

  // Extract main image
  const imgMatch = html.match(/<img[^>]*id="mainpicbox"[^>]*src="([^"]+)"/);
  if (imgMatch) result.imageUrl = imgMatch[1];

  // Extract description (og:description)
  const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
  if (descMatch) result.description = descMatch[1];

  // Extract accords
  const accordMatches = html.matchAll(/class="[^"]*accord-box[^"]*"[^>]*>[\s\S]*?<div>([^<]+)<\/div>/g);
  const accords: string[] = [];
  for (const m of accordMatches) {
    const accord = m[1].trim();
    if (accord) accords.push(accord);
  }
  if (accords.length > 0) result.accords = accords;

  // Extract notes by pyramid
  const noteSections: Record<string, string[]> = { top: [], heart: [], base: [] };
  const topMatch = html.match(/Top notes[^<]*<[^>]*>([\s\S]*?)<\/div>/);
  const heartMatch = html.match(/Middle notes[^<]*<[^>]*>([\s\S]*?)<\/div>/);
  const baseMatch = html.match(/Base notes[^<]*<[^>]*>([\s\S]*?)<\/div>/);

  const extractNotes = (section: string): string[] => {
    const notes: string[] = [];
    const matches = section.matchAll(/alt="([^"]+)"/g);
    for (const m of matches) notes.push(m[1]);
    return notes;
  };

  if (topMatch) result.topNotes = extractNotes(topMatch[1]);
  if (heartMatch) result.heartNotes = extractNotes(heartMatch[1]);
  if (baseMatch) result.baseNotes = extractNotes(baseMatch[1]);

  return result;
}
