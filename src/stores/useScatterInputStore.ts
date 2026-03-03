// src/stores/useScatterInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_SCATTER_DATA = [1, 2.1, 2, 3.9, 3, 6.2, 4, 7.8, 5, 10.1, 6, 12.3, 7, 13.8, 8, 16.1];

const MIN_POINTS = 3;
const MAX_POINTS = 20;
const MIN_VALUE = 0;
const MAX_VALUE = 100;

/** Serialize flat pairs to inline format: `(x, y) (x, y) ...` */
function pointsToRaw(pts: number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    pairs.push(`(${pts[i]}, ${pts[i + 1]})`);
  }
  return pairs.join(" ");
}

type ParseResult =
  | { ok: true; values: number[] }
  | { ok: false; error: string };

/**
 * Parse `(x, y)` pairs — accepts:
 *   (1, 2.1) (2, 3.9)   — parenthesized inline
 *   1, 2.1 | 2, 3.9     — pipe-separated
 *   1 2.1, 2 3.9         — flat even-count numbers
 */
function validateScatter(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter at least 3 data points" };

  const values: number[] = [];

  // Try parenthesized pairs first: (x, y)
  const parenPairs = [...trimmed.matchAll(/\(\s*([^,)]+)\s*,\s*([^)]+)\s*\)/g)];
  if (parenPairs.length > 0) {
    for (const m of parenPairs) {
      const x = Number(m[1].trim());
      const y = Number(m[2].trim());
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return { ok: false, error: `Invalid number in "${m[0]}"` };
      }
      if (x < MIN_VALUE || x > MAX_VALUE || y < MIN_VALUE || y > MAX_VALUE) {
        return { ok: false, error: `Values must be ${MIN_VALUE}–${MAX_VALUE}` };
      }
      values.push(x, y);
    }
  } else {
    // Fallback: flat numbers split by commas/spaces, taken as x,y pairs
    const parts = trimmed.split(/[\s,]+/).filter(Boolean);
    if (parts.length % 2 !== 0) {
      return { ok: false, error: "Need even number of values (x, y pairs)" };
    }
    for (let i = 0; i < parts.length; i++) {
      const v = Number(parts[i]);
      if (!Number.isFinite(v)) {
        return { ok: false, error: `"${parts[i]}" is not a valid number` };
      }
      if (v < MIN_VALUE || v > MAX_VALUE) {
        return { ok: false, error: `Values must be ${MIN_VALUE}–${MAX_VALUE}` };
      }
      values.push(v);
    }
  }

  const numPoints = values.length / 2;
  if (numPoints < MIN_POINTS) {
    return { ok: false, error: `Need at least ${MIN_POINTS} points` };
  }
  if (numPoints > MAX_POINTS) {
    return { ok: false, error: `Maximum ${MAX_POINTS} points allowed` };
  }

  return { ok: true, values };
}

function generateRandomScatter(size: number): number[] {
  const slope = 1.5 + Math.random() * 2;
  const intercept = Math.random() * 5;
  const values: number[] = [];
  for (let i = 0; i < size; i++) {
    const x = Math.round((1 + (i / (size - 1)) * 8) * 10) / 10;
    const noise = (Math.random() - 0.5) * 3;
    const y = Math.round((slope * x + intercept + noise) * 10) / 10;
    values.push(x, Math.max(0, Math.min(MAX_VALUE, y)));
  }
  return values;
}

type ScatterInputState = {
  points: number[];
  rawInput: string;
  error: string | null;

  setRawInput: (raw: string) => void;
  commitInput: () => void;
  randomize: () => void;
  generateRandom: (size: number) => void;
  reset: () => void;
};

export const useScatterInputStore = create<ScatterInputState>()(
  persist(
    (set, get) => ({
      points: DEFAULT_SCATTER_DATA,
      rawInput: pointsToRaw(DEFAULT_SCATTER_DATA),
      error: null,

      setRawInput(raw: string) {
        const result = validateScatter(raw);
        if (result.ok) {
          set({ rawInput: raw, points: result.values, error: null });
        } else {
          set({ rawInput: raw, error: result.error });
        }
      },

      commitInput() {
        const { error, points } = get();
        if (error) {
          set({ rawInput: pointsToRaw(points), error: null });
        }
      },

      randomize() {
        const size = get().points.length / 2;
        const pts = generateRandomScatter(size);
        set({ points: pts, rawInput: pointsToRaw(pts), error: null });
      },

      generateRandom(size: number) {
        const pts = generateRandomScatter(size);
        set({ points: pts, rawInput: pointsToRaw(pts), error: null });
      },

      reset() {
        set({
          points: DEFAULT_SCATTER_DATA,
          rawInput: pointsToRaw(DEFAULT_SCATTER_DATA),
          error: null,
        });
      },
    }),
    {
      name: "tn-scatter-input",
      partialize: (s) => ({ points: s.points }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rawInput = pointsToRaw(state.points);
        }
      },
    },
  ),
);
