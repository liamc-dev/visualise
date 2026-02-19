import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  effectsEnabled: boolean;
  toggleEffects: () => void;
  setEffectsEnabled: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      effectsEnabled: true,

      toggleEffects: () =>
        set((state) => ({ effectsEnabled: !state.effectsEnabled })),

      setEffectsEnabled: (value: boolean) =>
        set({ effectsEnabled: value }),
    }),
    { name: "tn-effects" },
  ),
);
