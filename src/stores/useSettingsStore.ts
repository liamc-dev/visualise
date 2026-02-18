import { create } from "zustand";

type SettingsState = {
  glowEnabled: boolean;
  toggleGlow: () => void;
  setGlowEnabled: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>(set => ({
  glowEnabled: false,

  toggleGlow: () =>
    set(state => ({ glowEnabled: !state.glowEnabled })),

  setGlowEnabled: (value: boolean) =>
    set({ glowEnabled: value }),
}));