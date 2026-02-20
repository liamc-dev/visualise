import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  effectsEnabled: boolean;
  toggleEffects: () => void;
  setEffectsEnabled: (value: boolean) => void;
  editorFontSize: number;
  setEditorFontSize: (size: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      effectsEnabled: true,

      toggleEffects: () =>
        set((state) => ({ effectsEnabled: !state.effectsEnabled })),

      setEffectsEnabled: (value: boolean) =>
        set({ effectsEnabled: value }),

      editorFontSize: 14,

      setEditorFontSize: (size: number) =>
        set({ editorFontSize: Math.min(20, Math.max(12, size)) }),
    }),
    { name: "tn-effects" },
  ),
);
