import { Fragrance } from "@/types";
import { parseJson, NOTE_FAMILIES } from "@/lib/utils";

export interface QuizOption {
  label: string;
  value: string;
  weights: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "vibe",
    question: "What feeling do you want to project?",
    options: [
      { label: "Fresh & clean", value: "fresh", weights: { citrus: 3, fresh: 3, aquatic: 2, green: 2 } },
      { label: "Warm & sensual", value: "warm", weights: { gourmand: 3, resinous: 2, woody: 2, oriental: 2 } },
      { label: "Bold & mysterious", value: "bold", weights: { leather: 3, woody: 2, spicy: 3, earthy: 2 } },
      { label: "Soft & romantic", value: "soft", weights: { floral: 3, powdery: 3, musky: 2, fruity: 1 } },
    ],
  },
  {
    id: "intensity",
    question: "How much presence do you like?",
    options: [
      { label: "Subtle, skin-scent", value: "subtle", weights: { musky: 3, powdery: 2, green: 2 } },
      { label: "Moderate", value: "moderate", weights: { woody: 2, floral: 2, fresh: 2 } },
      { label: "Strong & noticeable", value: "strong", weights: { spicy: 2, gourmand: 2, oriental: 2 } },
      { label: "Beast mode", value: "beast", weights: { leather: 3, resinous: 2, woody: 2 } },
    ],
  },
  {
    id: "season",
    question: "Which season are you shopping for?",
    options: [
      { label: "Spring", value: "spring", weights: { floral: 3, green: 2, citrus: 2 } },
      { label: "Summer", value: "summer", weights: { citrus: 3, aquatic: 3, fruity: 2 } },
      { label: "Fall", value: "fall", weights: { woody: 3, spicy: 2, earthy: 2 } },
      { label: "Winter", value: "winter", weights: { gourmand: 3, resinous: 2, oriental: 2 } },
    ],
  },
  {
    id: "adventure",
    question: "How adventurous are you feeling?",
    options: [
      { label: "Crowd-pleasers", value: "safe", weights: { fresh: 2, citrus: 2, woody: 2 } },
      { label: "Explore a bit", value: "explore", weights: { floral: 2, spicy: 2, fruity: 2 } },
      { label: "Somewhere unusual", value: "unusual", weights: { leather: 3, earthy: 2, resinous: 2 } },
    ],
  },
  {
    id: "occasion",
    question: "Where will you wear it most?",
    options: [
      { label: "Everyday / work", value: "everyday", weights: { fresh: 2, woody: 2, citrus: 2, musky: 1 } },
      { label: "Date night", value: "date", weights: { gourmand: 2, floral: 2, spicy: 2 } },
      { label: "Special occasions", value: "special", weights: { resinous: 3, leather: 2, oriental: 2 } },
    ],
  },
];

export interface FamilyGaps {
  present: string[];
  missing: string[];
}

// Shared helper: which note families are present in / missing from a set of fragrances.
export function getFamilyGaps(fragrances: Fragrance[]): FamilyGaps {
  const presentFamilies = new Set<string>();
  for (const f of fragrances) {
    const accords = parseJson<string[]>(f.accords, []);
    for (const a of accords) {
      const match = NOTE_FAMILIES.find((fam) => a.toLowerCase().includes(fam));
      if (match) presentFamilies.add(match);
    }
    for (const fn of f.fragranceNotes ?? []) {
      if (NOTE_FAMILIES.includes(fn.note.family)) presentFamilies.add(fn.note.family);
    }
  }
  return {
    present: Array.from(presentFamilies),
    missing: NOTE_FAMILIES.filter((fam) => !presentFamilies.has(fam)),
  };
}

export interface Direction {
  family: string;
  score: number;
  rationale: string;
}

export type QuizAnswers = Record<string, string>;

// Combine quiz answer weights with collection gaps to rank families to explore.
export function scoreDirections(answers: QuizAnswers, owned: Fragrance[]): Direction[] {
  const scores: Record<string, number> = {};

  for (const q of QUIZ_QUESTIONS) {
    const answer = answers[q.id];
    if (!answer) continue;
    const option = q.options.find((o) => o.value === answer);
    if (!option) continue;
    for (const [family, weight] of Object.entries(option.weights)) {
      scores[family] = (scores[family] ?? 0) + weight;
    }
  }

  const { missing } = getFamilyGaps(owned);
  const missingSet = new Set(missing);

  // Boost families the user doesn't own yet — those are the real "explore" wins.
  for (const family of Object.keys(scores)) {
    if (missingSet.has(family)) scores[family] += 3;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([family, score]) => ({
      family,
      score,
      rationale: missingSet.has(family)
        ? `Matches your answers and isn't in your collection yet — a fresh direction.`
        : `Reinforces a direction you already enjoy.`,
    }));
}
