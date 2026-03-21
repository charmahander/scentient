import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJson<T>(str: string | T, fallback: T): T {
  if (Array.isArray(str)) return str as T;
  if (typeof str !== "string") return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export const ACCORD_COLORS: Record<string, string> = {
  woody: "#8B6914",
  floral: "#FF85A2",
  citrus: "#FFB347",
  oriental: "#C3721A",
  fresh: "#7EC8E3",
  gourmand: "#D4A574",
  aquatic: "#4FC3F7",
  green: "#81C784",
  spicy: "#EF5350",
  musky: "#CE93D8",
  powdery: "#F8BBD9",
  earthy: "#A1887F",
  sweet: "#F06292",
  amber: "#FFB300",
  leather: "#6D4C41",
  smoky: "#78909C",
  fruity: "#FF8A65",
  animalic: "#8D6E63",
  resinous: "#BF8E3E",
  herbal: "#66BB6A",
};

export function getAccordColor(accord: string): string {
  const key = accord.toLowerCase().split(" ")[0];
  return ACCORD_COLORS[key] ?? "#9E9E9E";
}

export const NOTE_FAMILIES = [
  "floral",
  "woody",
  "citrus",
  "oriental",
  "fresh",
  "gourmand",
  "aquatic",
  "green",
  "spicy",
  "musky",
  "fruity",
  "herbal",
  "earthy",
  "leather",
  "powdery",
  "resinous",
];

export const BOTTLE_SHAPES: { value: string; label: string }[] = [
  { value: "tall", label: "Tall / Rectangular" },
  { value: "round", label: "Round / Oval" },
  { value: "spray", label: "Classic Spray" },
  { value: "flacon", label: "Flacon / Ornate" },
  { value: "rectangular", label: "Wide Rectangular" },
];

export const CONCENTRATIONS = ["Parfum", "EDP", "EDT", "EDC", "Cologne", "Other"];

export const SEASONS = ["spring", "summer", "fall", "winter"];

export const TIMES_OF_DAY = ["day", "night", "all-day"];

export const OCCASIONS = ["casual", "formal", "date", "sport", "office"];
