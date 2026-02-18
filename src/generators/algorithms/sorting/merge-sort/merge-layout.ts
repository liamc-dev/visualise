// src/algorithms/sorting/trace/merge/merge-layout.ts

export const MS_TOP_PADDING_ROWS = 2;
export const MS_ROW_GAP = 2;

export type MergeLayout = {
  rowY: (depth: number) => number; // grid-units
  shiftX: (globalIndex: number, node: { mid?: number }, unified: boolean) => number; // grid-units
};

export function makeMergeLayout(_n: number): MergeLayout {
  const rowY = (depth: number) => MS_TOP_PADDING_ROWS + depth * MS_ROW_GAP;

  // if node has a mid, we create a “gap” after mid by shifting right-side +1 column.
  const shiftX = (globalIndex: number, node: { mid?: number }, unified: boolean) => {
    if (unified) return globalIndex;

    const mid = node.mid;
    if (typeof mid !== "number") return globalIndex;

    return globalIndex > mid ? globalIndex + 1 : globalIndex;
  };

  return { rowY, shiftX };
}
