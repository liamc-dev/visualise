// src/algorithms/sorting/trace/merge/merge-sort-trace.ts
import type { TraceFrame, TraceScene, TracePointer, TraceTone } from "../../../../types/trace-types";
import { createOpsChart, nLogNRef } from "../../../../lib/ops-chart";
import { makeMergeLayout } from "./merge-layout";

type StackNode = {
  id: number;
  lo: number;
  hi: number;
  mid?: number;
  depth: number;
  phase:
    | "start"
    | "split"
    | "recurse-left"
    | "recurse-right"
    | "merge"
    | "write"
    | "end";
  temp?: number[];
  // merge-local pointers (temp-space indices)
  i?: number;
  j?: number;
  k?: number; // global index
};

let ID = 1;

export function mergeSortTrace(input: number[]): TraceFrame[] {
  ID = 1;

  const arr = [...input];
  const frames: TraceFrame[] = [];
  const stack: StackNode[] = [];

  const layout = makeMergeLayout(arr.length);
  const opsChart = createOpsChart(nLogNRef(arr.length));

  let stepNo = 0;

  const push = (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[]; // global indices in arr
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
    unified?: boolean;
  }) => {
    const scene = buildScene({
      arr,
      stack,
      layout,
      unified: !!args.unified,
      opsChart,
    });

    const focusNodes = buildFocusNodes({
      stack,
      highlight: args.highlight ?? [],
    });

    // pointers drive focus for i/j/k (single source of truth)
    if (args.pointers?.length) {
      for (const p of args.pointers) {
        if (p.target.kind === "node") focusNodes.push(p.target.nodeId);
      }
    }

    frames.push({
      id: `ms.${args.kind}.${stepNo++}`,
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

  mergeSort(arr, 0, arr.length - 1, 0, stack, push, layout, opsChart, true);

  return frames;
}

/* -------------------------
   Trace scene construction
------------------------- */

function cellId(nodeId: number, globalIndex: number) {
  return `n:${nodeId}:${globalIndex}`;
}

function tempId(nodeId: number, tempIndex: number) {
  return `t:${nodeId}:${tempIndex}`;
}

function isRootEnd(stack: StackNode[]) {
  const last = stack[stack.length - 1];
  return !!last && last.depth === 0 && last.phase === "end";
}

function visibleStack(stack: StackNode[]) {
  // matches old getVisibleNodes() behaviour:
  // when root is ended, show only root node row.
  if (!stack.length) return [];
  if (isRootEnd(stack)) return [stack[0]];
  return stack;
}

function buildScene(args: {
  arr: number[];
  stack: StackNode[];
  layout: ReturnType<typeof makeMergeLayout>;
  unified: boolean;
  opsChart: ReturnType<typeof createOpsChart>;
}): TraceScene {
  const { arr, stack, layout, unified, opsChart } = args;

  const nodes: TraceScene["nodes"] = [];

  const vis = visibleStack(stack);
  const active = stack[stack.length - 1];
  const activeDepth = active?.depth ?? 0;

  // Derive k tone for root-level cells during merge/write
  const merging = active && (active.phase === "merge" || active.phase === "write");
  const kIndex = merging && typeof active.k === "number" ? active.k : undefined;

  // Stack rows
  for (const node of vis) {
    const y = layout.rowY(node.depth);

    // semantic emphasis (NOT opacity)
    const emphasis = node.depth === activeDepth ? "active" : "soft";

    for (let g = node.lo; g <= node.hi; g++) {
      const x = layout.shiftX(g, node, unified);

      // k pointer targets root cell — apply warning tone
      const cellTone: TraceTone | undefined =
        node.depth === 0 && kIndex !== undefined && g === kIndex
          ? "warning"
          : undefined;

      nodes.push({
        id: cellId(node.id, g),
        kind: "cell",
        pos: { x, y, depth: node.depth },
        meta: {
          value: arr[g],
          nodeId: node.id,
          lo: node.lo,
          hi: node.hi,
          mid: node.mid,
          depth: node.depth,
          phase: node.phase,
          index: g,

          // keep mid purely informational (do NOT style it)
          // isMid removed to avoid renderer coupling

          emphasis,
          ...(cellTone ? { tone: cellTone } : undefined),
        },
      });
    }
  }

  // Temp buffer row for ACTIVE node only (top of stack)
  if (active?.temp && (active.phase === "merge" || active.phase === "write")) {
    const yTemp = layout.rowY(active.depth) + 1;
    const iIdx = typeof active.i === "number" ? active.i : -1;
    const jIdx = typeof active.j === "number" ? active.j : -1;

    for (let t = 0; t < active.temp.length; t++) {
      const globalIndex = active.lo + t;
      const x = layout.shiftX(globalIndex, active, unified);

      // i/j pointers target temp cells — apply matching tones
      const tempTone: TraceTone =
        t === iIdx ? "cyan" :
        t === jIdx ? "magenta" :
        "muted";

      nodes.push({
        id: tempId(active.id, t),
        kind: "temp",
        pos: { x, y: yTemp, depth: active.depth },
        meta: {
          value: active.temp[t],
          nodeId: active.id,
          tempIndex: t,
          globalIndex,
          depth: active.depth,

          // temp should read as "aux buffer"
          emphasis: "soft",

          tone: tempTone,
          opacityMul: 0.85,
        },
      });
    }
  }

  const overlays: TraceScene["overlays"] = [];

  // Active band (original feel)
  if (active) {
    overlays.push({
      kind: "band",
      id: `band:d${active.depth}`,
      y: layout.rowY(active.depth),
      height: 1,
      emphasis: "active",
    });
  }

  // Depth labels
  const depths = Array.from(new Set(vis.map((n) => n.depth))).sort((a, b) => a - b);
  for (const d of depths) {
    overlays.push({
      kind: "text",
      id: `depth:${d}`,
      x: -1.2,
      y: layout.rowY(d), // top of row
      text: `d${d}`,
      emphasis: d === activeDepth ? "active" : "soft",
    });
  }

  const chart = opsChart.overlay();
  if (chart) overlays.push(chart);

  return {
    nodes,
    overlays,
  };
}

function buildFocusNodes(args: { stack: StackNode[]; highlight: number[] }) {
  const { stack, highlight } = args;
  const vis = visibleStack(stack);

  const focus: string[] = [];
  const set = new Set(highlight);

  // Highlight matching cells across all visible stack frames
  for (const node of vis) {
    for (let g = node.lo; g <= node.hi; g++) {
      if (!set.has(g)) continue;
      focus.push(cellId(node.id, g));
    }
  }

  const active = stack[stack.length - 1];

  if (!active || !active.temp || (active.phase !== "merge" && active.phase !== "write")) {
    return focus;
  }

  // Only map highlight -> temp cells during "merge" phase.
  // During "write", highlights are usually for destination indices (k),
  // and temp focus should come from pointers (i/j).
  if (active.phase === "merge") {
    const totalSize = active.temp.length;

    for (let t = 0; t < totalSize; t++) {
      const g = active.lo + t;
      if (!set.has(g)) continue;
      focus.push(tempId(active.id, t));
    }
  }

  return focus;
}

/* -------------------------
   Pointer helpers
------------------------- */

function buildMergePointers(stack: StackNode[], active: StackNode | undefined): TracePointer[] {
  if (!active) return [];

  const out: TracePointer[] = [];
  const leftSize = typeof active.mid === "number" ? active.mid - active.lo + 1 : 0;
  const totalSize = active.temp?.length ?? 0;

  if (typeof active.i === "number" && active.temp && active.i >= 0 && active.i < leftSize) {
    out.push({
      id: "i",
      label: "i",
      target: { kind: "node", nodeId: tempId(active.id, active.i), anchor: "bottom" },
      lane: "below",
      color: "var(--color-tn-cyan)",
    });
  }

  if (typeof active.j === "number" && active.temp && active.j >= 0 && active.j < totalSize) {
    out.push({
      id: "j",
      label: "j",
      target: { kind: "node", nodeId: tempId(active.id, active.j), anchor: "bottom" },
      lane: "below",
      color: "var(--color-tn-magenta)",
    });
  }

  if (typeof active.k === "number" && stack.length) {
    const rootNodeId = stack[0].id; // always the real root frame id
    out.push({
      id: "k",
      label: "k",
      target: { kind: "node", nodeId: cellId(rootNodeId, active.k), anchor: "top" },
      lane: "above",
      color: "var(--color-tn-warning)",
    });
  }

  return out;
}

/* -------------------------
   MergeSort recursion (trace-first)
------------------------- */

function mergeSort(
  arr: number[],
  left: number,
  right: number,
  depth: number,
  stack: StackNode[],
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
    unified?: boolean;
  }) => void,
  layout: ReturnType<typeof makeMergeLayout>,
  opsChart: ReturnType<typeof createOpsChart>,
  isRoot = false
) {
  const node: StackNode = {
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
    mid: node.mid,
    depth: node.depth,
    phase: node.phase,
  });

  const rangeHighlight = (lo: number, hi: number) =>
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, t) => lo + t) : [];

  if (isRoot) {
    push({
      kind: "init",
      codeToken: "ms.init",
      narrationToken: "ms.init",
      meta: { ...baseMeta(), isRoot: true },
    });
  }

  if (left >= right) {
    push({
      kind: "return",
      codeToken: "ms.base_return",
      narrationToken: "ms.base_return",
      highlight: left >= 0 && left < arr.length ? [left] : [],
      meta: { ...baseMeta(), isBaseCase: true },
    });
    stack.pop();
    return;
  }

  const mid = Math.floor((left + right) / 2);
  node.mid = mid;

  node.phase = "split";
  push({
    kind: "split",
    codeToken: "ms.split",
    narrationToken: "ms.split",
    // clearer than focusing "mid": show the segment being split
    highlight: rangeHighlight(left, right).filter((idx) => idx !== mid),
    meta: baseMeta(),
  });

  node.phase = "recurse-left";
  push({
    kind: "recurse_left",
    codeToken: "ms.recurse_left",
    narrationToken: "ms.recurse_left",
    meta: { ...baseMeta(), side: "left" },
  });

  mergeSort(arr, left, mid, depth + 1, stack, push, layout, opsChart);

  node.phase = "split";
  push({
    kind: "return",
    codeToken: "ms.return_left",
    narrationToken: "ms.return_left",
    meta: { ...baseMeta(), from: "left" },
  });

  node.phase = "recurse-right";
  push({
    kind: "recurse_right",
    codeToken: "ms.recurse_right",
    narrationToken: "ms.recurse_right",
    meta: { ...baseMeta(), side: "right" },
  });

  mergeSort(arr, mid + 1, right, depth + 1, stack, push, layout, opsChart);

  node.phase = "split";
  push({
    kind: "return",
    codeToken: "ms.return_right",
    narrationToken: "ms.return_right",
    meta: { ...baseMeta(), from: "right" },
  });

  node.phase = "merge";
  merge(arr, left, mid, right, stack, push, opsChart);

  node.temp = undefined;
  node.i = node.j = node.k = undefined;

  node.phase = "end";
  push({
    kind: "return",
    codeToken: "ms.return",
    narrationToken: "ms.return",
    meta: baseMeta(),
  });

  if (isRoot) {
    push({
      kind: "done",
      codeToken: "ms.done",
      narrationToken: "ms.done",
      highlight: Array.from({ length: arr.length }, (_, i) => i),
      unified: true,
      meta: { ...baseMeta(), isRoot: true, sorted: true },
    });
  }

  stack.pop();
}

/* -------------------------
   Merge (trace-first)
------------------------- */

function merge(
  arr: number[],
  left: number,
  mid: number,
  right: number,
  stack: StackNode[],
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;
    highlight?: number[];
    pointers?: TracePointer[];
    meta?: Record<string, unknown>;
    unified?: boolean;
  }) => void,
  opsChart: ReturnType<typeof createOpsChart>,
) {
  const node = stack[stack.length - 1];
  node.phase = "merge";

  const temp = arr.slice(left, right + 1);
  node.temp = temp;

  const leftSize = mid - left + 1;
  const totalSize = right - left + 1;

  let i = 0;
  let j = leftSize;
  let k = left;

  const mergeMeta = () => ({
    nodeId: node.id,
    lo: node.lo,
    hi: node.hi,
    mid: node.mid,
    depth: node.depth,
    phase: node.phase,
    mergeLo: left,
    mergeMid: mid,
    mergeHi: right,
    leftSize,
    totalSize,
    i,
    j,
    k,
  });

  // snapshot pointers (iBefore/jBefore/kBefore)
  const ptrSnapshot = (iSnap = i, jSnap = j, kSnap = k) => {
    node.i = iSnap;
    node.j = jSnap;
    node.k = kSnap;
    return buildMergePointers(stack, node);
  };

  push({
    kind: "merge_start",
    codeToken: "ms.merge_start",
    narrationToken: "ms.merge_start",
    pointers: ptrSnapshot(),
    meta: mergeMeta(),
  });

  while (i < leftSize && j < totalSize) {
    opsChart.record();
    push({
      kind: "merge_compare",
      codeToken: "ms.merge_compare",
      narrationToken: "ms.merge_compare",
      // focus comes from pointers (i/j/k); avoid extra highlight noise
      pointers: ptrSnapshot(),
      meta: mergeMeta(),
    });

    const takeLeft = temp[i] <= temp[j];

    const iBefore = i;
    const jBefore = j;
    const kBefore = k;

    const written = takeLeft ? temp[iBefore] : temp[jBefore];
    arr[kBefore] = written;

    node.phase = "write";
    push({
      kind: "merge_write",
      codeToken: takeLeft ? "ms.merge_write_left" : "ms.merge_write_right",
      narrationToken: takeLeft ? "ms.merge_write_left" : "ms.merge_write_right",
      highlight: [kBefore], // destination index
      pointers: ptrSnapshot(iBefore, jBefore, kBefore),
      meta: {
        ...mergeMeta(),
        takeLeft,
        iBefore,
        jBefore,
        kBefore,
        written,
      },
    });

    if (takeLeft) i++;
    else j++;
    k++;

    node.phase = "merge";
  }

  while (i < leftSize) {
    const iBefore = i;
    const kBefore = k;

    const written = temp[iBefore];
    arr[kBefore] = written;

    node.phase = "write";
    push({
      kind: "merge_write",
      codeToken: "ms.merge_write_remaining_left",
      narrationToken: "ms.merge_write_remaining_left",
      highlight: [kBefore],
      pointers: ptrSnapshot(iBefore, j, kBefore),
      meta: {
        ...mergeMeta(),
        iBefore,
        kBefore,
        written,
        remaining: "left",
      },
    });

    i++;
    k++;
    node.phase = "merge";
  }

  while (j < totalSize) {
    const jBefore = j;
    const kBefore = k;

    const written = temp[jBefore];
    arr[kBefore] = written;

    node.phase = "write";
    push({
      kind: "merge_write",
      codeToken: "ms.merge_write_remaining_right",
      narrationToken: "ms.merge_write_remaining_right",
      highlight: [kBefore],
      pointers: ptrSnapshot(i, jBefore, kBefore),
      meta: {
        ...mergeMeta(),
        jBefore,
        kBefore,
        written,
        remaining: "right",
      },
    });

    j++;
    k++;
    node.phase = "merge";
  }

  push({
    kind: "merge_done",
    codeToken: "ms.merge_done",
    narrationToken: "ms.merge_done",
    pointers: ptrSnapshot(i, j, Math.min(k - 1, right)),
    meta: mergeMeta(),
  });
}
