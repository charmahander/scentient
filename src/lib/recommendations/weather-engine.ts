import { Fragrance, WeatherData, DailyRecommendation } from "@/types";
import { parseJson } from "@/lib/utils";

interface WeatherProfile {
  preferredAccords: string[];
  avoidAccords: string[];
  preferredSeasons: string[];
  description: string;
}

function getWeatherProfile(weather: WeatherData): WeatherProfile {
  const { temp, humidity, main } = weather;

  // Hot & humid
  if (temp > 85 && humidity > 65) {
    return {
      preferredAccords: ["citrus", "aquatic", "fresh", "green", "fruity"],
      avoidAccords: ["heavy", "oriental", "leather", "smoky", "amber"],
      preferredSeasons: ["summer"],
      description: "Hot and humid — light, fresh, and citrusy scents shine",
    };
  }

  // Hot & dry
  if (temp > 85 && humidity <= 65) {
    return {
      preferredAccords: ["citrus", "aquatic", "floral", "fresh", "herbal"],
      avoidAccords: ["heavy", "sweet", "powdery"],
      preferredSeasons: ["summer"],
      description: "Hot and dry — bright florals and aquatics work beautifully",
    };
  }

  // Cold
  if (temp < 40) {
    return {
      preferredAccords: ["woody", "oriental", "amber", "leather", "resinous", "spicy", "gourmand"],
      avoidAccords: ["aquatic", "light", "citrus"],
      preferredSeasons: ["winter", "fall"],
      description: "Cold weather — warm, rich, and enveloping scents are perfect",
    };
  }

  // Cool / mild
  if (temp >= 40 && temp <= 65) {
    return {
      preferredAccords: ["floral", "woody", "musky", "powdery", "green", "herbal"],
      avoidAccords: [],
      preferredSeasons: ["fall", "spring"],
      description: "Cool and mild — the full spectrum opens up",
    };
  }

  // Rainy / overcast
  if (main === "Rain" || main === "Drizzle" || main === "Thunderstorm") {
    return {
      preferredAccords: ["woody", "earthy", "mossy", "herbal", "green", "musky"],
      avoidAccords: [],
      preferredSeasons: ["fall", "spring"],
      description: "Rainy day — petrichor-like, earthy, and green notes feel at home",
    };
  }

  // Mild / perfect
  return {
    preferredAccords: ["floral", "fresh", "musky", "citrus", "green", "fruity"],
    avoidAccords: [],
    preferredSeasons: ["spring", "summer"],
    description: "Perfect weather — florals, fresh musks, and light citrus reign",
  };
}

function scoreFragrance(fragrance: Fragrance, profile: WeatherProfile): number {
  let score = 50;
  const accords = parseJson<string[]>(fragrance.accords, []);
  const seasons = parseJson<string[]>(fragrance.season, []);

  // Accord matching
  for (const accord of accords) {
    const accordLower = accord.toLowerCase();
    if (profile.preferredAccords.some((a) => accordLower.includes(a))) score += 15;
    if (profile.avoidAccords.some((a) => accordLower.includes(a))) score -= 20;
  }

  // Season matching
  for (const season of seasons) {
    if (profile.preferredSeasons.includes(season)) score += 10;
  }

  // Rating boost
  if (fragrance.rating) score += fragrance.rating * 2;

  return Math.max(0, Math.min(100, score));
}

function getWeatherMatchReasons(fragrance: Fragrance, weather: WeatherData): string[] {
  const accords = parseJson<string[]>(fragrance.accords, []);
  const reasons: string[] = [];

  if (weather.temp > 80) reasons.push("light enough for hot weather");
  if (weather.temp < 45) reasons.push("warm and enveloping for cold days");
  if (weather.main === "Rain") reasons.push("earthy and grounding for rainy conditions");

  const freshAccords = accords.filter((a) =>
    ["citrus", "aquatic", "fresh", "green"].some((f) => a.toLowerCase().includes(f))
  );
  if (freshAccords.length > 0 && weather.temp > 70) {
    reasons.push(`fresh ${freshAccords[0]} notes are perfect for the warmth`);
  }

  return reasons;
}

export function getWeatherRecommendations(
  fragrances: Fragrance[],
  weather: WeatherData
): DailyRecommendation[] {
  const profile = getWeatherProfile(weather);

  const owned = fragrances.filter((f) => f.owned);
  const scored = owned.map((f) => ({
    fragrance: f,
    score: scoreFragrance(f, profile),
    reasoning: profile.description,
    weatherMatch: getWeatherMatchReasons(f, weather),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

export { getWeatherProfile };
