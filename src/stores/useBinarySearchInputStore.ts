// src/stores/useBinarySearchInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_ARRAY = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const DEFAULT_TARGET = 17;

const MIN_LENGTH = 3;
const MAX_LENGTH = 24;
const MIN_VALUE = 1;
const MAX_VALUE = 99;

function arrayToRaw(arr: number[]): string {
  return arr.join(", ");
}

type ParseResult =
  | { ok: true; values: number[] }
  | { ok: false; error: string };

function validateSortedArray(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter at least 3 numbers" };

  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  const values: number[] = [];

  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return { ok: false, error: `"${p}" is not a valid integer` };
    }
    if (n < MIN_VALUE || n > MAX_VALUE) {
      return { ok: false, error: `Values must be between ${MIN_VALUE} and ${MAX_VALUE}` };
    }
    values.push(n);
  }

  if (values.length < MIN_LENGTH) {
    return { ok: false, error: `Need at least ${MIN_LENGTH} elements` };
  }
  if (values.length > MAX_LENGTH) {
    return { ok: false, error: `Maximum ${MAX_LENGTH} elements allowed` };
  }

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) {
      return { ok: false, error: "Array must be sorted in ascending order" };
    }
  }

  return { ok: true, values };
}

function validateTarget(raw: string): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter a target" };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: "Not a valid integer" };
  }
  if (n < MIN_VALUE || n > MAX_VALUE) {
    return { ok: false, error: `${MIN_VALUE}–${MAX_VALUE}` };
  }
  return { ok: true, value: n };
}

/** Generate a sorted array of unique values. */
function generateSortedArray(size: number): number[] {
  const pool: number[] = [];
  for (let i = MIN_VALUE; i <= MAX_VALUE; i++) pool.push(i);
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size).sort((a, b) => a - b);
}

type BinarySearchInputState = {
  array: number[];
  target: number;
  rawInput: string;
  rawTarget: string;
  error: string | null;
  targetError: string | null;

  setRawInput: (raw: string) => void;
  setRawTarget: (raw: string) => void;
  commitInput: () => void;
  commitTarget: () => void;
  randomize: () => void;
  generateRandom: (size: number) => void;
  reset: () => void;
};

export const useBinarySearchInputStore = create<BinarySearchInputState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_ARRAY,
      target: DEFAULT_TARGET,
      rawInput: arrayToRaw(DEFAULT_ARRAY),
      rawTarget: String(DEFAULT_TARGET),
      error: null,
      targetError: null,

      setRawInput(raw: string) {
        const result = validateSortedArray(raw);
        if (result.ok) {
          set({ rawInput: raw, array: result.values, error: null });
        } else {
          set({ rawInput: raw, error: result.error });
        }
      },

      setRawTarget(raw: string) {
        const result = validateTarget(raw);
        if (result.ok) {
          set({ rawTarget: raw, target: result.value, targetError: null });
        } else {
          set({ rawTarget: raw, targetError: result.error });
        }
      },

      commitInput() {
        const { error, array } = get();
        if (error) {
          set({ rawInput: arrayToRaw(array), error: null });
        }
      },

      commitTarget() {
        const { targetError, target } = get();
        if (targetError) {
          set({ rawTarget: String(target), targetError: null });
        }
      },

      randomize() {
        const arr = generateSortedArray(get().array.length);
        const t = arr[Math.floor(Math.random() * arr.length)];
        set({
          array: arr,
          target: t,
          rawInput: arrayToRaw(arr),
          rawTarget: String(t),
          error: null,
          targetError: null,
        });
      },

      generateRandom(size: number) {
        const arr = generateSortedArray(size);
        const t = arr[Math.floor(Math.random() * arr.length)];
        set({
          array: arr,
          target: t,
          rawInput: arrayToRaw(arr),
          rawTarget: String(t),
          error: null,
          targetError: null,
        });
      },

      reset() {
        set({
          array: DEFAULT_ARRAY,
          target: DEFAULT_TARGET,
          rawInput: arrayToRaw(DEFAULT_ARRAY),
          rawTarget: String(DEFAULT_TARGET),
          error: null,
          targetError: null,
        });
      },
    }),
    {
      name: "tn-binary-search-input",
      partialize: (s) => ({ array: s.array, target: s.target }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rawInput = arrayToRaw(state.array);
          state.rawTarget = String(state.target);
        }
      },
    },
  ),
);
