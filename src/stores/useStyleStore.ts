// src/stores/useStyleStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Style = "default" | "terminal" | "clean" | "organic";
const STYLES: Style[] = ["default", "terminal", "clean", "organic"];

type StyleState = {
  style: Style;
  setStyle: (style: Style) => void;
  cycleStyle: () => void;
};

export const useStyleStore = create<StyleState>()(
  persist(
    (set, get) => ({
      style: "terminal",
      setStyle: (style) => set({ style }),
      cycleStyle: () => {
        const idx = STYLES.indexOf(get().style);
        set({ style: STYLES[(idx + 1) % STYLES.length] });
      },
    }),
    { name: "tn-style" }
  )
);
