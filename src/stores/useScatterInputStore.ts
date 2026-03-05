// src/stores/useScatterInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_SCATTER_DATA = [1, 2.1, 2, 3.9, 3, 6.2, 4, 7.8, 5, 10.1, 6, 12.3, 7, 13.8, 8, 16.1];
const DEFAULT_EPOCHS = 20;
const DEFAULT_LEARNING_RATE = 0.1;

const MIN_POINTS = 3;
const MAX_POINTS = 20;
const MIN_VALUE = 0;
const MAX_VALUE = 100;
const MIN_EPOCHS = 1;
const MAX_EPOCHS = 99;

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
  const patterns = [skewedClusters, diagonalBand, lopsidedBlob, offsetClusters];
  const gen = patterns[Math.floor(Math.random() * patterns.length)];
  return gen(size);
}

/** Two clusters offset along a random axis. */
function skewedClusters(size: number): number[] {
  const angle = Math.random() * Math.PI;
  const cx = 4 + Math.random() * 2, cy = 4 + Math.random() * 2;
  const sep = 2 + Math.random() * 3;
  const values: number[] = [];
  for (let i = 0; i < size; i++) {
    const side = i < size / 2 ? -1 : 1;
    const ox = cx + side * sep * Math.cos(angle) + (Math.random() - 0.5) * 3;
    const oy = cy + side * sep * Math.sin(angle) + (Math.random() - 0.5) * 3;
    values.push(clampRound(ox), clampRound(oy));
  }
  return values;
}

/** Points along a tilted band with spread. */
function diagonalBand(size: number): number[] {
  const slope = 0.5 + Math.random() * 2;
  const intercept = Math.random() * 3;
  const spread = 1.5 + Math.random() * 3;
  const values: number[] = [];
  for (let i = 0; i < size; i++) {
    const x = 1 + Math.random() * 8;
    const y = slope * x + intercept + (Math.random() - 0.5) * spread;
    values.push(clampRound(x), clampRound(y));
  }
  return values;
}

/** One dense cluster + sparse outliers on the opposite side. */
function lopsidedBlob(size: number): number[] {
  const bx = 2 + Math.random() * 3, by = 2 + Math.random() * 3;
  const values: number[] = [];
  const dense = Math.ceil(size * 0.65);
  for (let i = 0; i < dense; i++) {
    values.push(
      clampRound(bx + (Math.random() - 0.5) * 2.5),
      clampRound(by + (Math.random() - 0.5) * 2.5),
    );
  }
  for (let i = dense; i < size; i++) {
    values.push(
      clampRound(bx + 4 + Math.random() * 3),
      clampRound(by + 3 + Math.random() * 3),
    );
  }
  return values;
}

/** Two compact clusters with random offset. */
function offsetClusters(size: number): number[] {
  const ax = 1.5 + Math.random() * 2, ay = 1.5 + Math.random() * 2;
  const bx = ax + 3 + Math.random() * 4, by = ay + 2 + Math.random() * 4;
  const values: number[] = [];
  for (let i = 0; i < size; i++) {
    const [cx, cy] = i < size / 2 ? [ax, ay] : [bx, by];
    values.push(
      clampRound(cx + (Math.random() - 0.5) * 2),
      clampRound(cy + (Math.random() - 0.5) * 2),
    );
  }
  return values;
}

function clampRound(v: number): number {
  return Math.round(Math.max(MIN_VALUE, Math.min(MAX_VALUE, v)) * 10) / 10;
}

type ScatterInputState = {
  points: number[];
  epochs: number;
  learningRate: number;
  rawInput: string;
  error: string | null;

  setRawInput: (raw: string) => void;
  setEpochs: (n: number) => void;
  setLearningRate: (lr: number) => void;
  commitInput: () => void;
  randomize: () => void;
  generateRandom: (size: number) => void;
  reset: () => void;
};

export const useScatterInputStore = create<ScatterInputState>()(
  persist(
    (set, get) => ({
      points: DEFAULT_SCATTER_DATA,
      epochs: DEFAULT_EPOCHS,
      learningRate: DEFAULT_LEARNING_RATE,
      rawInput: pointsToRaw(DEFAULT_SCATTER_DATA),
      error: null,

      setLearningRate(lr: number) {
        set({ learningRate: lr });
      },

      setEpochs(n: number) {
        set({ epochs: Math.max(MIN_EPOCHS, Math.min(MAX_EPOCHS, n)) });
      },

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
          epochs: DEFAULT_EPOCHS,
          learningRate: DEFAULT_LEARNING_RATE,
          rawInput: pointsToRaw(DEFAULT_SCATTER_DATA),
          error: null,
        });
      },
    }),
    {
      name: "tn-scatter-input",
      partialize: (s) => ({ points: s.points, epochs: s.epochs, learningRate: s.learningRate }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rawInput = pointsToRaw(state.points);
        }
      },
    },
  ),
);
