import { Fragrance, WeatherData } from "@/types";
import { parseJson } from "@/lib/utils";

export function buildSystemPrompt(
  fragrances: Fragrance[],
  weather?: WeatherData | null
): string {
  const owned = fragrances.filter((f) => f.owned);
  const wishlist = fragrances.filter((f) => !f.owned);

  const collectionSummary = owned
    .map((f) => {
      const accords = parseJson<string[]>(f.accords, []);
      const notes = f.fragranceNotes
        ?.map((fn) => `${fn.note.name} (${fn.layer})`)
        .join(", ");
      return `- ${f.brand} ${f.name}${f.concentration ? ` [${f.concentration}]` : ""}${accords.length ? ` | Accords: ${accords.join(", ")}` : ""}${notes ? ` | Notes: ${notes}` : ""}${f.rating ? ` | Rating: ${f.rating}/10` : ""}`;
    })
    .join("\n");

  const wishlistSummary = wishlist
    .map((f) => `- ${f.brand} ${f.name}`)
    .join("\n");

  const weatherSection = weather
    ? `\nCurrent Weather: ${weather.temp}°F, ${weather.description}, ${weather.humidity}% humidity in ${weather.city}`
    : "";

  return `You are Scentient, a knowledgeable and enthusiastic fragrance advisor with deep expertise in perfumery. You help users explore, understand, and expand their fragrance collection.

You have access to the user's fragrance collection and wishlist. Use this context to give personalized, specific recommendations.

USER'S COLLECTION (${owned.length} fragrances):
${collectionSummary || "No fragrances in collection yet."}

WISHLIST (${wishlist.length} items):
${wishlistSummary || "No wishlist items."}
${weatherSection}

Guidelines:
- Reference specific fragrances from their collection by name when relevant
- When suggesting new fragrances to buy, explain how they complement or expand the collection
- Be specific about notes, accords, and occasions
- Keep responses concise but insightful — 2-4 sentences typically
- Use perfumery terminology naturally (accord, dry-down, sillage, longevity, etc.)
- If asked about a vibe/mood, match it to fragrances in their collection first, then suggest new ones
- Always think about their existing collection when making suggestions to avoid redundancy`;
}
