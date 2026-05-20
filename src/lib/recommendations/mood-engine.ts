import { Fragrance, WeatherData, DailyRecommendation } from "@/types";
import { parseJson } from "@/lib/utils";
import { getWeatherProfile, scoreAccords } from "@/lib/recommendations/weather-engine";

interface MoodProfile {
  preferredAccords: string[];
  avoidAccords: string[];
  preferredOccasions: string[];
  preferredTimeOfDay: string[];
  blurb: string;
}

export const MOOD_PROFILES: Record<string, MoodProfile> = {
  confident: {
    preferredAccords: ["woody", "leather", "amber", "spicy", "oud"],
    avoidAccords: ["powdery", "aquatic"],
    preferredOccasions: ["formal", "office", "date"],
    preferredTimeOfDay: ["day", "night"],
    blurb: "bold and self-assured",
  },
  fresh: {
    preferredAccords: ["citrus", "aquatic", "fresh", "green", "herbal"],
    avoidAccords: ["amber", "oud", "gourmand", "leather"],
    preferredOccasions: ["casual", "sport", "office"],
    preferredTimeOfDay: ["day"],
    blurb: "clean and invigorating",
  },
  cozy: {
    preferredAccords: ["gourmand", "vanilla", "amber", "woody", "musky", "sweet"],
    avoidAccords: ["aquatic", "citrus"],
    preferredOccasions: ["casual"],
    preferredTimeOfDay: ["night", "all-day"],
    blurb: "warm and comforting",
  },
  romantic: {
    preferredAccords: ["floral", "rose", "sweet", "musky", "powdery", "gourmand"],
    avoidAccords: ["aquatic", "sport"],
    preferredOccasions: ["date", "formal"],
    preferredTimeOfDay: ["night"],
    blurb: "soft and seductive",
  },
  energetic: {
    preferredAccords: ["citrus", "fruity", "spicy", "fresh", "green"],
    avoidAccords: ["powdery", "heavy"],
    preferredOccasions: ["sport", "casual"],
    preferredTimeOfDay: ["day"],
    blurb: "bright and lively",
  },
  professional: {
    preferredAccords: ["woody", "fresh", "citrus", "aromatic", "musky"],
    avoidAccords: ["gourmand", "sweet", "animalic"],
    preferredOccasions: ["office", "formal"],
    preferredTimeOfDay: ["day"],
    blurb: "polished and understated",
  },
  bold: {
    preferredAccords: ["oud", "leather", "spicy", "amber", "smoky", "animalic"],
    avoidAccords: ["fresh", "citrus", "aquatic"],
    preferredOccasions: ["night", "formal", "date"],
    preferredTimeOfDay: ["night"],
    blurb: "intense and statement-making",
  },
  relaxed: {
    preferredAccords: ["musky", "powdery", "green", "herbal", "woody", "floral"],
    avoidAccords: ["spicy", "smoky"],
    preferredOccasions: ["casual"],
    preferredTimeOfDay: ["all-day", "day"],
    blurb: "easygoing and mellow",
  },
};

export const MOODS = Object.keys(MOOD_PROFILES);

interface MoodInput {
  mood: string;
  occasion?: string;
  weather?: WeatherData | null;
}

function buildReasoning(
  mood: string,
  moodProfile: MoodProfile,
  matchedAccords: string[],
  weather?: WeatherData | null
): string {
  const accordPhrase = matchedAccords.length
    ? `its ${matchedAccords.slice(0, 2).join(" and ")} character`
    : "its profile";
  const weatherPhrase = weather ? ` and suits ${weather.temp}°F ${weather.description}` : "";
  return `${accordPhrase.charAt(0).toUpperCase() + accordPhrase.slice(1)} feels ${moodProfile.blurb}${weatherPhrase}.`;
}

export function getMoodRecommendations(
  fragrances: Fragrance[],
  { mood, occasion, weather }: MoodInput
): DailyRecommendation[] {
  const moodProfile = MOOD_PROFILES[mood] ?? MOOD_PROFILES.relaxed;
  const weatherProfile = weather ? getWeatherProfile(weather) : null;
  const owned = fragrances.filter((f) => f.owned);

  const scored = owned.map((f) => {
    const accords = parseJson<string[]>(f.accords, []);
    const occasions = parseJson<string[]>(f.occasion, []);
    const timeOfDay = parseJson<string[]>(f.timeOfDay, []);

    let score = 50;

    // Mood is the primary signal.
    score += scoreAccords(accords, moodProfile.preferredAccords, moodProfile.avoidAccords, {
      match: 16,
      penalty: 14,
    });

    // Weather as a secondary blend.
    if (weatherProfile) {
      score += scoreAccords(accords, weatherProfile.preferredAccords, weatherProfile.avoidAccords, {
        match: 7,
        penalty: 8,
      });
    }

    // Occasion match.
    if (occasion && occasions.includes(occasion)) score += 12;
    for (const o of occasions) {
      if (moodProfile.preferredOccasions.includes(o)) score += 4;
    }

    // Time-of-day fit.
    for (const t of timeOfDay) {
      if (moodProfile.preferredTimeOfDay.includes(t)) score += 4;
    }

    // Rating boost.
    if (f.rating) score += f.rating * 1.5;

    // In very hot weather, penalize beast-mode projection.
    if (weather && weather.temp > 85 && (f.projection ?? 0) >= 4.5) score -= 8;

    const matched = accords.filter((a) =>
      moodProfile.preferredAccords.some((p) => a.toLowerCase().includes(p))
    );

    return {
      fragrance: f,
      score: Math.max(0, Math.min(100, Math.round(score))),
      reasoning: buildReasoning(mood, moodProfile, matched, weather),
      weatherMatch: matched,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
