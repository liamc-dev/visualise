// src/stores/useArrayInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  validateAndParse,
  fisherYatesShuffle,
  generateRandomArray,
} from "../lib/array-utils";

const DEFAULT_ARRAY = [12, 5, 19, 3, 14, 8, 17, 1, 10, 6, 15, 2, 18, 7, 13];

function arrayToRaw(arr: number[]): string {
  return arr.join(", ");
}

type ArrayInputState = {
  array: number[];
  rawInput: string;
  error: string | null;

  setRawInput: (raw: string) => void;
  commitInput: () => void;
  shuffle: () => void;
  generateRandom: (size: number) => void;
  reset: () => void;
};

export const useArrayInputStore = create<ArrayInputState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_ARRAY,
      rawInput: arrayToRaw(DEFAULT_ARRAY),
      error: null,

      setRawInput(raw: string) {
        const result = validateAndParse(raw);
        if (result.ok) {
          set({ rawInput: raw, array: result.values, error: null });
        } else {
          set({ rawInput: raw, error: result.error });
        }
      },

      commitInput() {
        const { error, array } = get();
        if (error) {
          // Revert to last valid array
          set({ rawInput: arrayToRaw(array), error: null });
        }
      },

      shuffle() {
        const shuffled = fisherYatesShuffle([...get().array]);
        set({ array: shuffled, rawInput: arrayToRaw(shuffled), error: null });
      },

      generateRandom(size: number) {
        const arr = generateRandomArray(size);
        set({ array: arr, rawInput: arrayToRaw(arr), error: null });
      },

      reset() {
        set({
          array: DEFAULT_ARRAY,
          rawInput: arrayToRaw(DEFAULT_ARRAY),
          error: null,
        });
      },
    }),
    {
      name: "tn-array-input",
      partialize: (s) => ({ array: s.array }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rawInput = arrayToRaw(state.array);
        }
      },
    }
  )
);
