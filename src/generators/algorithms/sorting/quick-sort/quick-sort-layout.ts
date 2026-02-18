// src/algorithms/sorting/quick-sort/quick-sort-layout.ts

export const QS_TOP_PADDING_ROWS = 2;
export const QS_ROW_GAP = 2;

export function makeQuickSortLayout() {
  const rowY = (depth: number) => QS_TOP_PADDING_ROWS + depth * QS_ROW_GAP;

  return {
    rowY,
    colOffset: 0,
  };
}
