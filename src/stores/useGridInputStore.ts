// src/stores/useGridInputStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  decodeGridInput,
  encodeGridInput,
  randomizeGrid,
  DEFAULT_BFS_GRID,
  DEFAULT_GRID_ROWS,
  DEFAULT_GRID_COLS,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
} from "../lib/grid-utils";

type GridInputState = {
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

export const useGridInputStore = create<GridInputState>()(
  persist(
    (set, get) => ({
      array: DEFAULT_BFS_GRID,
      rows: DEFAULT_GRID_ROWS,
      cols: DEFAULT_GRID_COLS,
      wallDensity: 0,

      setRows(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { cols, wallDensity } = get();
        set({
          rows: clamped,
          array: randomizeGrid(clamped, cols, wallDensity),
        });
      },

      setCols(n: number) {
        const clamped = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, n));
        const { rows, wallDensity } = get();
        set({
          cols: clamped,
          array: randomizeGrid(rows, clamped, wallDensity),
        });
      },

      setStart(row: number, col: number) {
        const { array, rows, cols } = get();
        const { walls } = decodeGridInput(array);
        const clampedRow = Math.max(0, Math.min(rows - 1, row));
        const clampedCol = Math.max(0, Math.min(cols - 1, col));
        set({ array: encodeGridInput(rows, cols, clampedRow, clampedCol, walls) });
      },

      setWallDensity(d: number) {
        const clamped = Math.max(0, Math.min(0.4, d));
        const { array, rows, cols } = get();
        const { startRow, startCol } = decodeGridInput(array);

        // Regenerate walls with new density, keep start position
        const walls: boolean[][] = [];
        for (let r = 0; r < rows; r++) {
          const row: boolean[] = [];
          for (let c = 0; c < cols; c++) {
            row.push(Math.random() < clamped);
          }
          walls.push(row);
        }

        set({
          wallDensity: clamped,
          array: encodeGridInput(rows, cols, startRow, startCol, walls),
        });
      },

      randomize() {
        const { rows, cols, wallDensity } = get();
        set({ array: randomizeGrid(rows, cols, wallDensity) });
      },

      reset() {
        set({
          array: DEFAULT_BFS_GRID,
          rows: DEFAULT_GRID_ROWS,
          cols: DEFAULT_GRID_COLS,
          wallDensity: 0.15,
        });
      },
    }),
    {
      name: "tn-grid-input",
      partialize: (s) => ({
        array: s.array,
        rows: s.rows,
        cols: s.cols,
        wallDensity: s.wallDensity,
      }),
    },
  ),
);
