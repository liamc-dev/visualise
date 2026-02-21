// src/lib/weighted-grid-utils.ts

import {
  DEFAULT_GRID_ROWS,
  DEFAULT_GRID_COLS,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
} from "./grid-utils";

export { MIN_GRID_SIZE, MAX_GRID_SIZE };

/**
 * Decode a number[] into { rows, cols, startRow, startCol, weights }.
 * Format: [rows, cols, startRow, startCol, ...cells]  (length = 4 + rows*cols)
 * Cell values: 0 = wall, 1–9 = traversable with that cost.
 */
export function decodeWeightedGrid(input: number[]): {
  rows: number;
  cols: number;
  startRow: number;
  startCol: number;
  weights: number[][];
} {
  const rows = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[0] ?? DEFAULT_GRID_ROWS));
  const cols = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[1] ?? DEFAULT_GRID_COLS));
  const startRow = Math.max(0, Math.min(rows - 1, input[2] ?? 0));
  const startCol = Math.max(0, Math.min(cols - 1, input[3] ?? 0));

  const weights: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const v = input[4 + r * cols + c] ?? 1;
      row.push(Math.max(0, Math.min(9, v)));
    }
    weights.push(row);
  }

  // Start cell is always open (weight >= 1)
  if (weights[startRow][startCol] === 0) {
    weights[startRow][startCol] = 1;
  }

  return { rows, cols, startRow, startCol, weights };
}

/**
 * Encode start position + weights into number[].
 * Format: [rows, cols, startRow, startCol, ...cells]
 */
export function encodeWeightedGrid(
  rows: number,
  cols: number,
  startRow: number,
  startCol: number,
  weights: number[][],
): number[] {
  const arr: number[] = [rows, cols, startRow, startCol];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      arr.push(weights[r]?.[c] ?? 1);
    }
  }
  // Start cell is always open
  if (arr[4 + startRow * cols + startCol] === 0) {
    arr[4 + startRow * cols + startCol] = 1;
  }
  return arr;
}

/**
 * Generate a random weighted grid.
 * Cells are 1–9 for open, 0 for walls (at given density).
 */
export function randomizeWeightedGrid(
  rows: number,
  cols: number,
  wallDensity: number,
): number[] {
  const startRow = Math.floor(Math.random() * rows);
  const startCol = Math.floor(Math.random() * cols);

  const weights: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      if (Math.random() < wallDensity) {
        row.push(0);
      } else {
        row.push(Math.floor(Math.random() * 9) + 1);
      }
    }
    weights.push(row);
  }

  return encodeWeightedGrid(rows, cols, startRow, startCol, weights);
}

/**
 * Default Dijkstra grid: 8x8, start at (1,1), varied weights, some walls.
 */
export const DEFAULT_DIJKSTRA_GRID: number[] = (() => {
  const rows = DEFAULT_GRID_ROWS;
  const cols = DEFAULT_GRID_COLS;
  const weights: number[][] = [
    [1, 1, 1, 0, 2, 3, 1, 1],
    [1, 1, 2, 0, 1, 5, 2, 1],
    [3, 1, 1, 0, 1, 1, 0, 4],
    [1, 2, 3, 1, 1, 0, 1, 1],
    [1, 1, 1, 2, 5, 0, 3, 1],
    [2, 0, 0, 1, 1, 1, 1, 2],
    [1, 1, 1, 0, 2, 1, 4, 1],
    [3, 2, 1, 1, 1, 3, 1, 1],
  ];

  return encodeWeightedGrid(rows, cols, 1, 1, weights);
})();
