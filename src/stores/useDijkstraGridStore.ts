// src/stores/useDijkstraGridStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  decodeWeightedGrid,
  encodeWeightedGrid,
  randomizeWeightedGrid,
  DEFAULT_DIJKSTRA_GRID,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
} from "../lib/weighted-grid-utils";

const DEFAULT_ROWS = 8;
const DEFAULT_COLS = 8;

type DijkstraGridState = {
  array: number[];
  rows: number;
  cols: number;
  wallDensity: number;

  setRows: (n: number) => void;
  setCols: (n: number) => void;
  setStart: (row: number, col: number) => void;
  setWallDensity: (d: number) => void;
  randomize: () => void;
  reset: () => void;
};

export const useDijkstraGridStore = create<DijkstraGridState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_DIJKSTRA_GRID,
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,
      wallDensity: 0.15,

      setRows(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { cols, wallDensity } = get();
        set({
          rows: clamped,
          array: randomizeWeightedGrid(clamped, cols, wallDensity),
        });
      },

      setCols(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { rows, wallDensity } = get();
        set({
          cols: clamped,
          array: randomizeWeightedGrid(rows, clamped, wallDensity),
        });
      },

      setStart(row: number, col: number) {
        const { array, rows, cols } = get();
        const { weights } = decodeWeightedGrid(array);
        const clampedRow = Math.max(0, Math.min(rows - 1, row));
        const clampedCol = Math.max(0, Math.min(cols - 1, col));
        set({ array: encodeWeightedGrid(rows, cols, clampedRow, clampedCol, weights) });
      },

      setWallDensity(d: number) {
        const clamped = Math.max(0, Math.min(0.4, d));
        const { array, rows, cols } = get();
        const { startRow, startCol } = decodeWeightedGrid(array);

        // Regenerate with new density, keep start position
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
          array: encodeWeightedGrid(rows, cols, startRow, startCol, weights),
        });
      },

      randomize() {
        const { rows, cols, wallDensity } = get();
        set({ array: randomizeWeightedGrid(rows, cols, wallDensity) });
      },

      reset() {
        set({
          array: DEFAULT_DIJKSTRA_GRID,
          rows: DEFAULT_ROWS,
          cols: DEFAULT_COLS,
          wallDensity: 0.15,
        });
      },
    }),
    {
      name: "tn-dijkstra-grid-input",
      partialize: (s) => ({
        array: s.array,
        rows: s.rows,
        cols: s.cols,
        wallDensity: s.wallDensity,
      }),
    },
  ),
);
