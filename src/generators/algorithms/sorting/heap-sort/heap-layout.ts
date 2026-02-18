export type HeapLayout = {
  arrayY: number;           // e.g. 1
  heapY0: number;           // e.g. 4 (tree start)
  rowGap: number;           // e.g. 2
  slotWidth: number;        // e.g. 1.2 “cells”
  treeWidth: number;        // computed for centering
  centerX: number;          // logical center x
  heapPos: Array<{ x: number; y: number; depth: number }>; // index -> pos
  heapEdges: Array<{ parent: number; child: number; id: string }>;
};

export function makeHeapLayout(n: number): HeapLayout {
  const arrayY = 1;
  const heapY0 = 4;
  const rowGap = 2;
  const slotWidth = 1.2;

  if (n <= 0) {
    return {
      arrayY, heapY0, rowGap, slotWidth,
      treeWidth: 0,
      centerX: 0,
      heapPos: [],
      heapEdges: [],
    };
  }

  const maxDepth = Math.floor(Math.log2(n));
  const maxNodesLastLevel = 2 ** maxDepth;
  const treeSlots = Math.max(2, maxNodesLastLevel);
  const treeWidth = treeSlots * slotWidth;

  // Center around the array row: array cells are [0..n-1] so center is (n-1)/2
  const centerX = (n - 1) / 2;

  const heapPos: Array<{ x: number; y: number; depth: number }> = [];

  for (let i = 0; i < n; i++) {
    const d = Math.floor(Math.log2(i + 1));
    const levelStart = 2 ** d - 1;
    const posInLevel = i - levelStart;
    const nodesInLevel = 2 ** d;

    const levelSlots = treeSlots / nodesInLevel;

    // left edge of the tree, centered around centerX
    const left = centerX - treeWidth / 2;

    const x = left + (posInLevel + 0.5) * levelSlots * slotWidth;
    const y = heapY0 + d * rowGap;

    heapPos.push({ x, y, depth: d });
  }

  const heapEdges: Array<{ parent: number; child: number; id: string }> = [];
  let e = 0;
  for (let p = 0; p < n; p++) {
    const l = 2 * p + 1;
    const r = 2 * p + 2;
    if (l < n) heapEdges.push({ parent: p, child: l, id: `he:${e++}` });
    if (r < n) heapEdges.push({ parent: p, child: r, id: `he:${e++}` });
  }

  return { arrayY, heapY0, rowGap, slotWidth, treeWidth, centerX, heapPos, heapEdges };
}
