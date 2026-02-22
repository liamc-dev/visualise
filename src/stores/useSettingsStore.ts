import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  effectsEnabled: boolean;
  toggleEffects: () => void;
  setEffectsEnabled: (value: boolean) => void;
  sweepEnabled: boolean;
  toggleSweep: () => void;
  codeHighlightEnabled: boolean;
  toggleCodeHighlight: () => void;
  editorFontSize: number;
  setEditorFontSize: (size: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      effectsEnabled: false,

      toggleEffects: () =>
        set((state) => ({ effectsEnabled: !state.effectsEnabled })),

      setEffectsEnabled: (value: boolean) =>
        set({ effectsEnabled: value }),

      sweepEnabled: false,

      toggleSweep: () =>
        set((state) => ({ sweepEnabled: !state.sweepEnabled })),

      codeHighlightEnabled: true,

      toggleCodeHighlight: () =>
        set((state) => ({ codeHighlightEnabled: !state.codeHighlightEnabled })),

      editorFontSize: 14,

      setEditorFontSize: (size: number) =>
        set({ editorFontSize: Math.min(20, Math.max(12, size)) }),
    }),
    { name: "tn-effects" },
  ),
);
