// src/stores/useLayoutStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  splitRatio: number;

  setSplitRatio: (ratio: number) => void;
  resetSplitRatio: () => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

const DEFAULT_RATIO = 0.62;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      splitRatio: DEFAULT_RATIO,

      setSplitRatio: (ratio) =>
        set(() => ({
          splitRatio: clamp(ratio, 0.25, 0.75),
        })),

      resetSplitRatio: () => set(() => ({ splitRatio: DEFAULT_RATIO })),

      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "algo-visualiser-layout",
      version: 1,

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
