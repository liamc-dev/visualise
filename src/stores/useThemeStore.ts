// src/stores/useThemeStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "tokyo-night" | "ember";
const THEMES: Theme[] = ["light", "dark", "tokyo-night", "ember"];

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
};

function getSystemDefault(): Theme {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemDefault(),
      setTheme: (theme) => set({ theme }),
      cycleTheme: () => {
        const idx = THEMES.indexOf(get().theme);
        set({ theme: THEMES[(idx + 1) % THEMES.length] });
      },
    }),
    { name: "theme" }
  )
);

