import { create } from "zustand";
import { Fragrance } from "@/types";

interface CollectionStore {
  fragrances: Fragrance[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;

  fetchFragrances: () => Promise<void>;
  addFragrance: (data: Partial<Fragrance>) => Promise<Fragrance | null>;
  updateFragrance: (id: string, data: Partial<Fragrance>) => Promise<void>;
  deleteFragrance: (id: string) => Promise<void>;
  setSelected: (id: string | null) => void;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  fragrances: [],
  loading: false,
  error: null,
  selectedId: null,

  fetchFragrances: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/fragrances");
      const data = await res.json();
      set({ fragrances: data, loading: false });
    } catch (e) {
      set({ error: "Failed to load collection", loading: false });
    }
  },

  addFragrance: async (data) => {
    try {
      const res = await fetch("/api/fragrances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const fragrance = await res.json();
      set((s) => ({ fragrances: [fragrance, ...s.fragrances] }));
      return fragrance;
    } catch {
      return null;
    }
  },

  updateFragrance: async (id, data) => {
    try {
      const res = await fetch(`/api/fragrances/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      set((s) => ({
        fragrances: s.fragrances.map((f) => (f.id === id ? updated : f)),
      }));
    } catch {}
  },

  deleteFragrance: async (id) => {
    try {
      await fetch(`/api/fragrances/${id}`, { method: "DELETE" });
      set((s) => ({
        fragrances: s.fragrances.filter((f) => f.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
      }));
    } catch {}
  },

  setSelected: (id) => set({ selectedId: id }),
}));
