// src/algorithms/sorting/trace/quick/quick-sort-trace.ts
import type { TraceFrame, TracePointer, TraceScene } from "../../../../types/trace-types";
import { makeQuickSortLayout } from "./quick-sort-layout";

type QuickSortStackNode = {
  id: number;
  lo: number;
  hi: number;
  depth: number;
  phase:
    | "start"
    | "partition"
    | "pivot"
    | "compare"
    | "swap"
    | "pivot-place"
    | "recurse-left"
    | "recurse-right"
    | "segment-sorted";

  pivotIndex?: number;
  scanIndex?: number; // j
  boundaryIndex?: number; // i
};

let ID = 1;

export function quickSortTrace(input: number[]): TraceFrame[] {
  ID = 1;

  const arr = [...input];
  const frames: TraceFrame[] = [];
  const stack: QuickSortStackNode[] = [];

  const layout = makeQuickSortLayout();
  let stepNo = 0;

  const push = (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;

    highlight?: number[]; // global indices (in arr)
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) => {
    const scene = buildScene({ arr, stack, layout });
    const focusNodes = buildFocusNodes({ stack, highlight: args.highlight ?? [] });

    // pointers also imply focus
    if (args.pointers?.length) {
      for (const p of args.pointers) {
        if (p.target.kind === "node") focusNodes.push(p.target.nodeId);
      }
    }

    frames.push({
      id: `qs.${args.kind}.${stepNo++}`,
      kind: args.kind,
      codeToken: args.codeToken,
      narrationToken: args.narrationToken,
      scene,
      focus: {
        nodes: focusNodes.length ? focusNodes : undefined,
        pointers: args.pointers?.length ? args.pointers : undefined,
      },
      meta: args.meta,
    });
  };

  quickSort(arr, 0, arr.length - 1, 0, stack, push, true);

  return frames;
}

/* -------------------------
   Scene construction
------------------------- */

function cellId(nodeId: number, globalIndex: number) {
  return `qs:n:${nodeId}:${globalIndex}`;
}

function visibleStack(nodes: QuickSortStackNode[]) {
  // Same rule as old overlay: only show the latest node per depth.
  if (!nodes.length) return [];

  const latestIndexByDepth = new Map<number, number>();
  for (let i = nodes.length - 1; i >= 0; i--) {
    const d = nodes[i].depth;
    if (!latestIndexByDepth.has(d)) latestIndexByDepth.set(d, i);
  }

  return nodes.filter((node, idx) => latestIndexByDepth.get(node.depth) === idx);
}

function buildScene(args: {
  arr: number[];
  stack: QuickSortStackNode[];
  layout: ReturnType<typeof makeQuickSortLayout>;
}): TraceScene {
  const { arr, stack, layout } = args;

  const nodes: TraceScene["nodes"] = [];

  const vis = visibleStack(stack);
  const active = stack[stack.length - 1];
  const activeDepth = active?.depth ?? 0;

  for (const node of vis) {
    const y = layout.rowY(node.depth);
    const emphasis = node.depth === activeDepth ? "active" : "soft";

    for (let g = node.lo; g <= node.hi; g++) {
      const isPivot = typeof node.pivotIndex === "number" && g === node.pivotIndex;

      nodes.push({
        id: cellId(node.id, g),
        kind: "cell",
        pos: { x: layout.colOffset + g, y, depth: node.depth },
        meta: {
          value: arr[g],
          nodeId: node.id,
          lo: node.lo,
          hi: node.hi,
          depth: node.depth,
          phase: node.phase,
          index: g,

          // style hooks (GENERIC)
          emphasis, // stack fading
          // pivot = generic "warning tone" (renderer must stay agnostic)
          ...(isPivot
            ? {
                tone: "warning",
                weight: 2, // strong but below highlight
              }
            : undefined),
        },
      });
    }
  }

  const overlays: TraceScene["overlays"] = [];

  // active band (like old QuickSortOverlay)
  if (active) {
    overlays.push({
      kind: "band",
      id: `qs:band:d${active.depth}`,
      y: layout.rowY(active.depth),
      height: 1,
      emphasis: "active",
    });
  }

  // depth labels
  const depths = Array.from(new Set(vis.map((n) => n.depth))).sort((a, b) => a - b);
  for (const d of depths) {
    overlays.push({
      kind: "text",
      id: `qs:depth:${d}`,
      x: -1.2,
      y: layout.rowY(d),
      text: `d${d}`,
      emphasis: d === activeDepth ? "active" : "soft",
    });
  }

  return {
    nodes,
    overlays,
  };
}

function buildFocusNodes(args: { stack: QuickSortStackNode[]; highlight: number[] }) {
  const { stack, highlight } = args;
  const vis = visibleStack(stack);

  const focus: string[] = [];
  const set = new Set(highlight);

  // Highlight matching global indices across all visible stack frames
  for (const node of vis) {
    for (let g = node.lo; g <= node.hi; g++) {
      if (!set.has(g)) continue;
      focus.push(cellId(node.id, g));
    }
  }

  return focus;
}

/* -------------------------
   Pointer helpers
------------------------- */

function mkPtrs(active: QuickSortStackNode | undefined): TracePointer[] {
  if (!active) return [];
  const out: TracePointer[] = [];

  if (typeof active.pivotIndex === "number") {
    out.push({
      id: "pivot",
      label: "pivot",
      target: { kind: "node", nodeId: cellId(active.id, active.pivotIndex) },
      lane: "above",
      color: "var(--color-tn-warning)",
    });
  }

  if (typeof active.scanIndex === "number") {
    out.push({
      id: "j",
      label: "j",
      target: { kind: "node", nodeId: cellId(active.id, active.scanIndex) },
      lane: "above",
      color: "var(--color-tn-magenta)",
    });
  }

  if (typeof active.boundaryIndex === "number") {
    out.push({
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: cellId(active.id, active.boundaryIndex) },
      lane: "below",
      color: "var(--color-tn-cyan)",
    });
  }

  return out;
}

/* -------------------------
   QuickSort recursion (trace-first)
------------------------- */

function quickSort(
  arr: number[],
  left: number,
  right: number,
  depth: number,
  stack: QuickSortStackNode[],
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) => void,
  isRoot = false
) {
  const node: QuickSortStackNode = {
    id: ID++,
    lo: left,
    hi: right,
    depth,
    phase: "start",
  };
  stack.push(node);

  const baseMeta = () => ({
    nodeId: node.id,
    lo: node.lo,
    hi: node.hi,
    depth: node.depth,
    phase: node.phase,

    pivotIndex: node.pivotIndex,
    scanIndex: node.scanIndex,
    boundaryIndex: node.boundaryIndex,
  });

  const active = () => stack[stack.length - 1];

  if (isRoot) {
    push({
      kind: "init",
      codeToken: "qs.init",
      narrationToken: "qs.init",
      highlight: [],
      meta: { ...baseMeta(), isRoot: true },
    });
  }

  if (left >= right) {
    push({
      kind: "return",
      codeToken: "qs.base_return",
      narrationToken: "qs.base_return",
      highlight: left >= 0 && left < arr.length ? [left] : [],
      meta: { ...baseMeta(), isBaseCase: true },
    });

    if (isRoot) {
      node.pivotIndex = undefined;
      node.scanIndex = undefined;
      node.boundaryIndex = undefined;

      push({
        kind: "done",
        codeToken: "qs.done",
        narrationToken: "qs.done",
        highlight: Array.from({ length: arr.length }, (_, i) => i),
        meta: { ...baseMeta(), isRoot: true, sorted: true },
      });
    }

    stack.pop();
    return;
  }

  // Partition phase (still this call frame)
  node.phase = "partition";
  push({
    kind: "partition",
    codeToken: "qs.partition_call",
    narrationToken: "qs.partition_call",
    highlight: [],
    meta: baseMeta(),
  });

  const pivotIndex = partition(arr, left, right, stack, push, node, baseMeta);

  node.phase = "pivot-place";
  node.pivotIndex = pivotIndex;
  node.scanIndex = undefined;

  push({
    kind: "pivot_place",
    codeToken: "qs.partition_done",
    narrationToken: "qs.partition_done",
    highlight: [pivotIndex],
    pointers: mkPtrs(active()),
    meta: {
      ...baseMeta(),
      pivotIndex,
      pivotValue: arr[pivotIndex],
    },
  });

  // Recurse left
  node.phase = "recurse-left";
  push({
    kind: "recurse_left",
    codeToken: "qs.recurse_left_call",
    narrationToken: "qs.recurse_left_call",
    highlight: [],
    meta: {
      ...baseMeta(),
      side: "left",
      recurseLo: left,
      recurseHi: pivotIndex - 1,
    },
  });

  quickSort(arr, left, pivotIndex - 1, depth + 1, stack, push);

  node.phase = "partition";
  push({
    kind: "return",
    codeToken: "qs.recurse_left_return",
    narrationToken: "qs.recurse_left_return",
    highlight: [],
    meta: { ...baseMeta(), from: "left" },
  });

  // Recurse right
  node.phase = "recurse-right";
  push({
    kind: "recurse_right",
    codeToken: "qs.recurse_right_call",
    narrationToken: "qs.recurse_right_call",
    highlight: [],
    meta: {
      ...baseMeta(),
      side: "right",
      recurseLo: pivotIndex + 1,
      recurseHi: right,
    },
  });

  quickSort(arr, pivotIndex + 1, right, depth + 1, stack, push);

  node.phase = "partition";
  push({
    kind: "return",
    codeToken: "qs.recurse_right_return",
    narrationToken: "qs.recurse_right_return",
    highlight: [],
    meta: { ...baseMeta(), from: "right" },
  });

  node.phase = "segment-sorted";
  push({
    kind: "done",
    codeToken: "qs.segment_done",
    narrationToken: "qs.segment_done",
    highlight: [],
    meta: { ...baseMeta(), segmentSorted: true },
  });

  if (isRoot) {
    node.pivotIndex = undefined;
    node.scanIndex = undefined;
    node.boundaryIndex = undefined;

    push({
      kind: "done",
      codeToken: "qs.done",
      narrationToken: "qs.done",
      highlight: Array.from({ length: arr.length }, (_, i) => i),
      meta: { ...baseMeta(), isRoot: true, sorted: true },
    });
  }

  stack.pop();
}

/* -------------------------
   Partition (Lomuto)
------------------------- */

function partition(
  arr: number[],
  left: number,
  right: number,
  stack: QuickSortStackNode[],
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
  }) => void,
  node: QuickSortStackNode,
  baseMeta: () => Record<string, unknown>
): number {
  const pivot = arr[right];
  let i = left;

  const active = () => stack[stack.length - 1];

  // Pivot selection
  node.phase = "pivot";
  node.pivotIndex = right;
  node.scanIndex = undefined;
  node.boundaryIndex = i;

  push({
    kind: "choose_pivot",
    codeToken: "qs.choose_pivot",
    narrationToken: "qs.choose_pivot",
    highlight: [right],
    pointers: mkPtrs(active()),
    meta: {
      ...baseMeta(),
      pivotIndex: right,
      pivotValue: pivot,
      i,
      left,
      right,
    },
  });

  for (let j = left; j < right; j++) {
    const currentVal = arr[j];
    const leq = currentVal <= pivot;

    node.phase = "compare";
    node.scanIndex = j;
    node.boundaryIndex = i;

    push({
      kind: "compare",
      codeToken: "qs.compare",
      narrationToken: "qs.compare",
      highlight: [j, right],
      pointers: mkPtrs(active()),
      meta: {
        ...baseMeta(),
        pivotIndex: right,
        pivotValue: pivot,
        i,
        j,
        currentVal,
        relation: leq ? "≤" : ">",
      },
    });

    if (leq) {
      if (i !== j) {
        const leftVal = arr[i];
        const rightVal = arr[j];

        [arr[i], arr[j]] = [arr[j], arr[i]];

        node.phase = "swap";
        node.scanIndex = j;
        node.boundaryIndex = i;

        push({
          kind: "swap",
          codeToken: "qs.swap",
          narrationToken: "qs.swap",
          highlight: [i, j, right],
          pointers: mkPtrs(active()),
          meta: {
            ...baseMeta(),
            pivotIndex: right,
            pivotValue: pivot,
            i,
            j,
            swapped: true,
            aIndex: i,
            bIndex: j,
            aValue: leftVal,
            bValue: rightVal,
          },
        });
      } else {
        node.phase = "swap";
        node.scanIndex = j;
        node.boundaryIndex = i;

        push({
          kind: "swap",
          codeToken: "qs.keep_left",
          narrationToken: "qs.keep_left",
          highlight: [j, right],
          pointers: mkPtrs(active()),
          meta: {
            ...baseMeta(),
            pivotIndex: right,
            pivotValue: pivot,
            i,
            j,
            kept: true,
            value: currentVal,
          },
        });
      }

      i++;
      node.boundaryIndex = i;
    }
  }

  // Place pivot
  if (i !== right) {
    const pivotVal = arr[right];
    const toLeftVal = arr[i];

    [arr[i], arr[right]] = [arr[right], arr[i]];

    node.phase = "pivot-place";
    node.pivotIndex = i;
    node.scanIndex = undefined;
    node.boundaryIndex = i;

    push({
      kind: "pivot_place",
      codeToken: "qs.pivot_place",
      narrationToken: "qs.pivot_place",
      highlight: [i],
      pointers: mkPtrs(active()),
      meta: {
        ...baseMeta(),
        pivotFrom: right,
        pivotTo: i,
        pivotValue: pivotVal,
        swappedWith: toLeftVal,
      },
    });
  } else {
    node.phase = "pivot-place";
    node.scanIndex = undefined;
    node.boundaryIndex = i;

    push({
      kind: "pivot_place",
      codeToken: "qs.pivot_already",
      narrationToken: "qs.pivot_already",
      highlight: [right],
      pointers: mkPtrs(active()),
      meta: {
        ...baseMeta(),
        pivotIndex: right,
        pivotValue: pivot,
        alreadyInPlace: true,
      },
    });
  }

  push({
    kind: "return",
    codeToken: "qs.partition_return",
    narrationToken: "qs.partition_return",
    highlight: [],
    pointers: mkPtrs(active()),
    meta: {
      ...baseMeta(),
      returnPivotIndex: i,
    },
  });

  return i;
}
