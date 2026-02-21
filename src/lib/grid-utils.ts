// src/lib/grid-utils.ts

export const DEFAULT_GRID_ROWS = 8;
export const DEFAULT_GRID_COLS = 8;
export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 10;

/** [dr, dc, label] — 4-connected: up, right, down, left */
export const DIRECTIONS: readonly [number, number, string][] = [
  [-1, 0, "UP"],
  [0, 1, "RIGHT"],
  [1, 0, "DOWN"],
  [0, -1, "LEFT"],
];

/**
 * Decode a number[] into { rows, cols, startRow, startCol, walls }.
 *
 * New format: [rows, cols, startRow, startCol, ...cells]  (length = 4 + rows*cols)
 * Legacy format: [startRow, startCol, ...cells]  (length = 66 → 8×8 grid)
 */
export function decodeGridInput(input: number[]): {
  rows: number;
  cols: number;
  startRow: number;
  startCol: number;
  walls: boolean[][];
} {
  let rows: number;
  let cols: number;
  let startRow: number;
  let startCol: number;
  let cellOffset: number;

  if (input.length === 66) {
    // Legacy 8×8 format: [startRow, startCol, ...64 cells]
    rows = 8;
    cols = 8;
    startRow = Math.max(0, Math.min(rows - 1, input[0] ?? 0));
    startCol = Math.max(0, Math.min(cols - 1, input[1] ?? 0));
    cellOffset = 2;
  } else {
    // New format: [rows, cols, startRow, startCol, ...cells]
    rows = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[0] ?? DEFAULT_GRID_ROWS));
    cols = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, input[1] ?? DEFAULT_GRID_COLS));
    startRow = Math.max(0, Math.min(rows - 1, input[2] ?? 0));
    startCol = Math.max(0, Math.min(cols - 1, input[3] ?? 0));
    cellOffset = 4;
  }

  const walls: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      row.push((input[cellOffset + r * cols + c] ?? 0) === 1);
    }
    walls.push(row);
  }

  // Start cell is always open
  walls[startRow][startCol] = false;

  return { rows, cols, startRow, startCol, walls };
}

/**
 * Encode start position + walls into number[].
 * New format: [rows, cols, startRow, startCol, ...cells]
 */
export function encodeGridInput(
  rows: number,
  cols: number,
  startRow: number,
  startCol: number,
  walls: boolean[][],
): number[] {
  const arr: number[] = [rows, cols, startRow, startCol];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      arr.push(walls[r]?.[c] ? 1 : 0);
    }
  }
  // Start cell is always open
  arr[4 + startRow * cols + startCol] = 0;
  return arr;
}

/**
 * Generate a random grid with the given wall density (0–1).
 * Returns a random start position + random walls.
 */
export function randomizeGrid(
  rows: number,
  cols: number,
  wallDensity: number,
): number[] {
  const startRow = Math.floor(Math.random() * rows);
  const startCol = Math.floor(Math.random() * cols);

  const walls: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.random() < wallDensity);
    }
    walls.push(row);
  }

  return encodeGridInput(rows, cols, startRow, startCol, walls);
}

/**
 * Default BFS grid: 8×8, start at (1,1), ~10 scattered walls.
 */
export const DEFAULT_BFS_GRID: number[] = (() => {
  const rows = DEFAULT_GRID_ROWS;
  const cols = DEFAULT_GRID_COLS;
  const walls: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  // Scatter some walls to make it interesting
  const wallCells: [number, number][] = [
    [0, 3], [1, 3], [2, 3],
    [3, 5], [4, 5], [5, 5],
    [5, 1], [5, 2],
    [2, 6], [6, 3],
  ];
  for (const [r, c] of wallCells) {
    walls[r][c] = true;
  }

  return encodeGridInput(rows, cols, 1, 1, walls);
})();
