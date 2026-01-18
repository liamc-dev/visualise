import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "tokyo-night";
const THEMES: Theme[] = ["light", "dark", "tokyo-night"];

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "tokyo-night",
      setTheme: (theme) => set({ theme }),
      cycleTheme: () => {
        const idx = THEMES.indexOf(get().theme);
        set({ theme: THEMES[(idx + 1) % THEMES.length] });
      },
    }),
    { name: "theme" }
  )
);

