// src/lib/astar-grid-utils.ts

import {
  DEFAULT_GRID_ROWS,
  DEFAULT_GRID_COLS,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
} from "./grid-utils";

export { MIN_GRID_SIZE, MAX_GRID_SIZE };

/**
 * Decode a number[] into A* grid state.
 * Format: [rows, cols, startRow, startCol, goalRow, goalCol, ...cells]
 * Cell values: 0 = wall, 1–9 = traversable with that cost.
 */
export function decodeAstarGrid(input: number[]): {
  rows: number;
  cols: number;
  startRow: number;
  startCol: number;
  goalRow: number;
  goalCol: number;
  weights: number[][];
} {
  const rows = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[0] ?? DEFAULT_GRID_ROWS));
  const cols = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[1] ?? DEFAULT_GRID_COLS));
  const startRow = Math.max(0, Math.min(rows - 1, input[2] ?? 1));
  const startCol = Math.max(0, Math.min(cols - 1, input[3] ?? 1));
  const goalRow = Math.max(0, Math.min(rows - 1, input[4] ?? rows - 2));
  const goalCol = Math.max(0, Math.min(cols - 1, input[5] ?? cols - 2));

  const weights: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const v = input[6 + r * cols + c] ?? 1;
      row.push(Math.max(0, Math.min(9, v)));
    }
    weights.push(row);
  }

  // Start and goal cells are always open
  if (weights[startRow][startCol] === 0) {
    weights[startRow][startCol] = 1;
  }
  if (weights[goalRow][goalCol] === 0) {
    weights[goalRow][goalCol] = 1;
  }

  return { rows, cols, startRow, startCol, goalRow, goalCol, weights };
}

/**
 * Encode A* grid state into number[].
 * Format: [rows, cols, startRow, startCol, goalRow, goalCol, ...cells]
 */
export function encodeAstarGrid(
  rows: number,
  cols: number,
  startRow: number,
  startCol: number,
  goalRow: number,
  goalCol: number,
  weights: number[][],
): number[] {
  const arr: number[] = [rows, cols, startRow, startCol, goalRow, goalCol];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      arr.push(weights[r]?.[c] ?? 1);
    }
  }
  // Start and goal cells are always open
  if (arr[6 + startRow * cols + startCol] === 0) {
    arr[6 + startRow * cols + startCol] = 1;
  }
  if (arr[6 + goalRow * cols + goalCol] === 0) {
    arr[6 + goalRow * cols + goalCol] = 1;
  }
  return arr;
}

/**
 * Generate a random A* weighted grid.
 * Cells are 1–9 for open, 0 for walls (at given density).
 */
export function randomizeAstarGrid(
  rows: number,
  cols: number,
  wallDensity: number,
): number[] {
  const startRow = Math.floor(Math.random() * rows);
  const startCol = Math.floor(Math.random() * cols);
  let goalRow = Math.floor(Math.random() * rows);
  let goalCol = Math.floor(Math.random() * cols);

  // Ensure goal is different from start
  while (goalRow === startRow && goalCol === startCol) {
    goalRow = Math.floor(Math.random() * rows);
    goalCol = Math.floor(Math.random() * cols);
  }

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

  return encodeAstarGrid(rows, cols, startRow, startCol, goalRow, goalCol, weights);
}

/**
 * Default A* grid: 8x8, start at (1,1), goal at (6,6), varied weights, some walls.
 */
export const DEFAULT_ASTAR_GRID: number[] = (() => {
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

  return encodeAstarGrid(rows, cols, 1, 1, 6, 6, weights);
})();
