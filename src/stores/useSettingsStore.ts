import { create } from "zustand";
import { SettingsState } from "../utils/types";

export const useSettingsStore = create<SettingsState>(set => ({

    glowEnabled: false,
    toggleGlow: () => set(state => ({ glowEnabled: !state.glowEnabled})),

}));