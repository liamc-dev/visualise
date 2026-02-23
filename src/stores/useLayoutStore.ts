// src/stores/useLayoutStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  splitRatio: number;
  arrayInputCollapsed: boolean;
  graphInputCollapsed: boolean;
  gridInputCollapsed: boolean;
  dijkstraMode: "graph" | "grid";
  dijkstraInputCollapsed: boolean;
  astarInputCollapsed: boolean;
  binarySearchInputCollapsed: boolean;
  linearSearchInputCollapsed: boolean;

  setSplitRatio: (ratio: number) => void;
  resetSplitRatio: () => void;
  toggleArrayInput: () => void;
  toggleGraphInput: () => void;
  toggleGridInput: () => void;
  setDijkstraMode: (mode: "graph" | "grid") => void;
  toggleDijkstraInput: () => void;
  toggleAstarInput: () => void;
  toggleBinarySearchInput: () => void;
  toggleLinearSearchInput: () => void;
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
      arrayInputCollapsed: false,
      graphInputCollapsed: false,
      gridInputCollapsed: false,
      dijkstraMode: "graph",
      dijkstraInputCollapsed: false,
      astarInputCollapsed: false,
      binarySearchInputCollapsed: false,
      linearSearchInputCollapsed: false,

      setSplitRatio: (ratio) =>
        set(() => ({
          splitRatio: clamp(ratio, 0.25, 0.75),
        })),

      resetSplitRatio: () => set(() => ({ splitRatio: DEFAULT_RATIO })),

      toggleArrayInput: () =>
        set((s) => ({ arrayInputCollapsed: !s.arrayInputCollapsed })),

      toggleGraphInput: () =>
        set((s) => ({ graphInputCollapsed: !s.graphInputCollapsed })),

      toggleGridInput: () =>
        set((s) => ({ gridInputCollapsed: !s.gridInputCollapsed })),

      setDijkstraMode: (mode) => set({ dijkstraMode: mode }),

      toggleDijkstraInput: () =>
        set((s) => ({ dijkstraInputCollapsed: !s.dijkstraInputCollapsed })),

      toggleAstarInput: () =>
        set((s) => ({ astarInputCollapsed: !s.astarInputCollapsed })),

      toggleBinarySearchInput: () =>
        set((s) => ({ binarySearchInputCollapsed: !s.binarySearchInputCollapsed })),

      toggleLinearSearchInput: () =>
        set((s) => ({ linearSearchInputCollapsed: !s.linearSearchInputCollapsed })),

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
