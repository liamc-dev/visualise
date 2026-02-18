// src/stores/useNarrationStore.ts
import { create } from "zustand";
import type { NarrationMode } from "../types/algo-types";

type NarrationState = {
  mode: NarrationMode;
  setMode: (mode: NarrationMode) => void;
};

export const useNarrationStore = create<NarrationState>((set) => ({
  mode: "explain",
  setMode: (mode) => set({ mode }),
}));
