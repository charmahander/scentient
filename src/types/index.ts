export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  year?: number | null;
  concentration?: string | null;
  imageUrl?: string | null;
  fragranticaUrl?: string | null;
  description?: string | null;
  season: string[];
  timeOfDay: string[];
  occasion: string[];
  accords: string[];
  rating?: number | null;
  owned: boolean;
  bottleVolume?: number | null;
  bottleShape?: string | null;
  purchasePrice?: number | null;
  createdAt: string;
  updatedAt: string;
  collectionItem?: CollectionItem | null;
  fragranceNotes?: FragranceNote[];
}

export interface CollectionItem {
  id: string;
  fragranceId: string;
  amountMl?: number | null;
  position: number;
  notes?: string | null;
  addedAt: string;
}

export interface Note {
  id: string;
  name: string;
  family: string;
  description?: string | null;
}

export interface FragranceNote {
  id: string;
  fragranceId: string;
  noteId: string;
  layer: "top" | "heart" | "base";
  note: Note;
}

export type BottleShape = "tall" | "round" | "rectangular" | "spray" | "flacon";

export type Season = "spring" | "summer" | "fall" | "winter";

export type TimeOfDay = "day" | "night" | "all-day";

export type Occasion = "casual" | "formal" | "date" | "sport" | "office";

export type Concentration = "Parfum" | "EDP" | "EDT" | "EDC" | "Cologne";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  main: string;
  windSpeed: number;
  city: string;
  country: string;
  icon: string;
}

export interface DailyRecommendation {
  fragrance: Fragrance;
  score: number;
  reasoning: string;
  weatherMatch: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AccordData {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

export interface NoteFamily {
  family: string;
  notes: string[];
  count: number;
  color: string;
}

export interface FragranticaSearchResult {
  name: string;
  brand: string;
  year?: number;
  concentration?: string;
  imageUrl?: string;
  fragranticaUrl?: string;
  description?: string;
  accords?: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
}
