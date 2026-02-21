// src/stores/useGraphInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  decodeGraphInput,
  encodeGraphInput,
  serializeEdges,
  parseEdges,
  randomizeGraph,
  DEFAULT_DIJKSTRA_INPUT,
} from "../lib/graph-utils";

function arrayToRaw(arr: number[], weighted: boolean): string {
  const { edges } = decodeGraphInput(arr);
  return serializeEdges(edges, weighted);
}

type GraphInputState = {
  array: number[];
  rawInput: string;
  error: string | null;

  setRawInput: (raw: string, weighted: boolean) => void;
  setSource: (idx: number, weighted: boolean) => void;
  commitInput: (weighted: boolean) => void;
  randomize: (weighted: boolean) => void;
  reset: (defaults: number[], weighted: boolean) => void;
};

export const useGraphInputStore = create<GraphInputState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_DIJKSTRA_INPUT,
      rawInput: arrayToRaw(DEFAULT_DIJKSTRA_INPUT, true),
      error: null,

      setRawInput(raw: string, weighted: boolean) {
        const result = parseEdges(raw, weighted);
        if (result.ok) {
          const { array } = get();
          const encoded = encodeGraphInput(array[0], result.edges);
          set({ rawInput: raw, array: encoded, error: null });
        } else {
          set({ rawInput: raw, error: result.error });
        }
      },

      setSource(idx: number, weighted: boolean) {
        const { array } = get();
        const next = [...array];
        next[0] = Math.max(0, Math.min(5, idx));
        set({
          array: next,
          rawInput: arrayToRaw(next, weighted),
          error: null,
        });
      },

      commitInput(weighted: boolean) {
        const { error, array } = get();
        if (error) {
          set({ rawInput: arrayToRaw(array, weighted), error: null });
        }
      },

      randomize(weighted: boolean) {
        const arr = randomizeGraph(weighted);
        set({ array: arr, rawInput: arrayToRaw(arr, weighted), error: null });
      },

      reset(defaults: number[], weighted: boolean) {
        set({
          array: defaults,
          rawInput: arrayToRaw(defaults, weighted),
          error: null,
        });
      },
    }),
    {
      name: "tn-graph-input",
      partialize: (s) => ({ array: s.array }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rebuild rawInput from persisted array (default to weighted)
          state.rawInput = arrayToRaw(state.array, true);
        }
      },
    },
  ),
);
