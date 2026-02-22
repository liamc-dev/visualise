// src/generators/algorithms/sorting/counting-sort/counting-sort-layout.ts

export const CS_TOP_PADDING = 2;
export const CS_ROW_GAP = 2;

/** y-coordinate for each row. */
export const CS_INPUT_Y = CS_TOP_PADDING;
export const CS_COUNT_Y = CS_TOP_PADDING + CS_ROW_GAP;

/** Width of each wrapped count row (matches input width, min 10). */
export function csCountChunkWidth(inputLen: number): number {
  return Math.max(inputLen, 10);
}

/** How many rows the count array needs. */
export function csCountRowCount(k: number, chunkWidth: number): number {
  return Math.ceil(k / chunkWidth);
}

/** y-coordinate for the output row, pushed below count rows. */
export function csOutputY(countRows: number): number {
  return CS_COUNT_Y + countRows + 1;
}
