// src/stores/useAstarGridStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  decodeAstarGrid,
  encodeAstarGrid,
  randomizeAstarGrid,
  DEFAULT_ASTAR_GRID,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
} from "../lib/astar-grid-utils";

const DEFAULT_ROWS = 8;
const DEFAULT_COLS = 8;

type AstarGridState = {
  array: number[];
  rows: number;
  cols: number;
  wallDensity: number;

  setRows: (n: number) => void;
  setCols: (n: number) => void;
  setStart: (row: number, col: number) => void;
  setGoal: (row: number, col: number) => void;
  setWallDensity: (d: number) => void;
  randomize: () => void;
  reset: () => void;
};

export const useAstarGridStore = create<AstarGridState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_ASTAR_GRID,
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,
      wallDensity: 0.15,

      setRows(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { cols, wallDensity } = get();
        set({
          rows: clamped,
          array: randomizeAstarGrid(clamped, cols, wallDensity),
        });
      },

      setCols(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { rows, wallDensity } = get();
        set({
          cols: clamped,
          array: randomizeAstarGrid(rows, clamped, wallDensity),
        });
      },

      setStart(row: number, col: number) {
        const { array, rows, cols } = get();
        const { goalRow, goalCol, weights } = decodeAstarGrid(array);
        const clampedRow = Math.max(0, Math.min(rows - 1, row));
        const clampedCol = Math.max(0, Math.min(cols - 1, col));
        set({ array: encodeAstarGrid(rows, cols, clampedRow, clampedCol, goalRow, goalCol, weights) });
      },

      setGoal(row: number, col: number) {
        const { array, rows, cols } = get();
        const { startRow, startCol, weights } = decodeAstarGrid(array);
        const clampedRow = Math.max(0, Math.min(rows - 1, row));
        const clampedCol = Math.max(0, Math.min(cols - 1, col));
        set({ array: encodeAstarGrid(rows, cols, startRow, startCol, clampedRow, clampedCol, weights) });
      },

      setWallDensity(d: number) {
        const clamped = Math.max(0, Math.min(0.4, d));
        const { array, rows, cols } = get();
        const { startRow, startCol, goalRow, goalCol } = decodeAstarGrid(array);

        const weights: number[][] = [];
        for (let r = 0; r < rows; r++) {
          const row: number[] = [];
          for (let c = 0; c < cols; c++) {
            if (Math.random() < clamped) {
              row.push(0);
            } else {
              row.push(Math.floor(Math.random() * 9) + 1);
            }
          }
          weights.push(row);
        }

        set({
          wallDensity: clamped,
          array: encodeAstarGrid(rows, cols, startRow, startCol, goalRow, goalCol, weights),
        });
      },

      randomize() {
        const { rows, cols, wallDensity } = get();
        set({ array: randomizeAstarGrid(rows, cols, wallDensity) });
      },

      reset() {
        set({
          array: DEFAULT_ASTAR_GRID,
          rows: DEFAULT_ROWS,
          cols: DEFAULT_COLS,
          wallDensity: 0.15,
        });
      },
    }),
    {
      name: "tn-astar-grid-input",
      partialize: (s) => ({
        array: s.array,
        rows: s.rows,
        cols: s.cols,
        wallDensity: s.wallDensity,
      }),
    },
  ),
);
