"use client";

import { useEffect } from "react";
import { useCollectionStore } from "@/store/collection";

export function useCollection() {
  const store = useCollectionStore();

  useEffect(() => {
    if (store.fragrances.length === 0 && !store.loading) {
      store.fetchFragrances();
    }
  }, []);

  return store;
}
