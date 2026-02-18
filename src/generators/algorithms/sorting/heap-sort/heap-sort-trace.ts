// src/generators/algorithms/sorting/heap-sort/heap-sort-trace.ts
import type { TraceFrame, TraceScene, TracePointer } from "../../../../types/trace-types";
import { makeHeapLayout } from "./heap-layout";

export function heapSortTrace(input: number[]): TraceFrame[] {
  const arr = [...input];
  const frames: TraceFrame[] = [];

  const layout = makeHeapLayout(arr.length);

  const edgeIdByPair = new Map<string, string>();
  for (const e of layout.heapEdges) edgeIdByPair.set(`${e.parent}->${e.child}`, e.id);

  let stepNo = 0;

  // ---------------------------------------------------------------------------
  // Meta snapshots for narration
  // ---------------------------------------------------------------------------
  const withHeapMeta = (args: {
    meta?: Record<string, any>;
    ptrs?: { root?: number; child?: number; swapIdx?: number; end?: number };
    heapSize: number;
  }) => {
    const { meta, ptrs, heapSize } = args;

    const root = ptrs?.root;
    const child = ptrs?.child;
    const swapIdx = ptrs?.swapIdx;
    const end = ptrs?.end;

    return {
      ...(meta ?? {}),

      // canonical indices
      heapSize,
      root,
      child,
      swapIdx,
      end,

      // value snapshots (safe even when indices undefined)
      rootVal: typeof root === "number" ? arr[root] : undefined,
      childVal: typeof child === "number" ? arr[child] : undefined,
      swapVal: typeof swapIdx === "number" ? arr[swapIdx] : undefined,
    } as Record<string, any>;
  };

  const push = (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;

    heapSize: number;
    highlight?: number[];
    focusEdges?: string[];
    ptrs?: { root?: number; child?: number; swapIdx?: number; end?: number };
    meta?: Record<string, any>;
  }) => {
    const scene = buildHeapScene({
      arr,
      heapSize: args.heapSize,
      layout,
    });

    const focusNodes = (args.highlight ?? []).flatMap((i) => [`a:${i}`, `h:${i}`]);

    const pointers = buildPointers({
      ptrs: args.ptrs,
      heapSize: args.heapSize,
      arrayY: layout.arrayY,
    });

    frames.push({
      id: `hs.${args.kind}.${stepNo++}`,
      kind: args.kind,

      codeToken: args.codeToken,
      narrationToken: args.narrationToken,

      scene,
      focus: {
        nodes: focusNodes.length ? focusNodes : undefined,
        edges: args.focusEdges?.length ? args.focusEdges : undefined,
        pointers: pointers.length ? pointers : undefined,
      },

      // meta is the single source of truth for narration:
      // inject ptr indices + value snapshots so narration never prints "?"
      meta: withHeapMeta({
        meta: args.meta,
        ptrs: args.ptrs,
        heapSize: args.heapSize,
      }),
    });
  };

  // Build max heap
  buildMaxHeap(arr, push, edgeIdByPair);

  // Extract max repeatedly
  for (let end = arr.length - 1; end > 0; end--) {
    const maxVal = arr[0];
    swap(arr, 0, end);

    push({
      kind: "swap",
      codeToken: "hs.extract_max",
      narrationToken: "hs.extract_max",
      heapSize: end,
      highlight: [0, end],
      ptrs: { root: 0, end },
      meta: { maxVal, end },
    });

    siftDown(arr, 0, end, push, end, edgeIdByPair);
  }

  // End state: highlight all
  push({
    kind: "done",
    codeToken: "hs.done",
    narrationToken: "hs.done",
    heapSize: arr.length,
    highlight: arr.map((_, i) => i),
    ptrs: { end: arr.length },
    meta: { sorted: true },
  });

  return frames;
}

/* ---------- Scene builder (trace primitive) ---------- */

function buildHeapScene(args: {
  arr: number[];
  heapSize: number;
  layout: ReturnType<typeof makeHeapLayout>;
}): TraceScene {
  const { arr, heapSize, layout } = args;

  const nodes: TraceScene["nodes"] = [];

  // Array row
  for (let i = 0; i < arr.length; i++) {
    const inHeap = i < heapSize;

    nodes.push({
      id: `a:${i}`,
      kind: "cell",
      pos: { x: i, y: layout.arrayY, depth: 0 },
      meta: {
        value: arr[i],
        tone: inHeap ? "neutral" : "muted",
        opacityMul: inHeap ? 1 : 0.22,
        layer: "array",
        index: i,
      },
    });
  }

  // Heap tree nodes
  for (let i = 0; i < arr.length; i++) {
    const inHeap = i < heapSize;
    const p = layout.heapPos[i];

    nodes.push({
      id: `h:${i}`,
      kind: "cell",
      pos: { x: p.x, y: p.y, depth: p.depth },
      meta: {
        value: arr[i],
        tone: inHeap ? "neutral" : "muted",
        opacityMul: inHeap ? 1 : 0.22,
        layer: "heap",
        index: i,
        depth: p.depth,
      },
    });
  }

  const edges = layout.heapEdges
    .filter((e) => e.parent < heapSize && e.child < heapSize)
    .map((e) => {
      const p = layout.heapPos[e.parent];
      const c = layout.heapPos[e.child];

      const fromPt = edgeEndpoint(p, c);
      const toPt = edgeEndpoint(c, p);

      return {
        id: e.id, // e.g. "he:0"
        from: `h:${e.parent}`,
        to: `h:${e.child}`,
        kind: "tree",
        meta: {
          arrow: false, // heap connectors only
          fromPt,
          toPt,
        },
      };
    });

  return { nodes, edges, overlays: [] };
}

function buildPointers(args: {
  ptrs?: { root?: number; child?: number; swapIdx?: number; end?: number };
  heapSize: number;
  arrayY: number;
}): TracePointer[] {
  const { ptrs, heapSize, arrayY } = args;
  const out: TracePointer[] = [];
  if (!ptrs) return out;

  const childIdx = typeof ptrs.child === "number" ? ptrs.child : undefined;
  const swapIdx = typeof ptrs.swapIdx === "number" ? ptrs.swapIdx : undefined;

  const overlap = childIdx !== undefined && swapIdx !== undefined && childIdx === swapIdx;

  if (typeof ptrs.end === "number") {
    out.push({
      id: "end",
      label: "end",
      target: { kind: "pos", x: heapSize - 0.5, y: arrayY, anchor: "bottom" },
      lane: "below",
      color: "var(--color-tn-subtle)",
    });
  }

  if (typeof ptrs.root === "number") {
    out.push({
      id: "root",
      label: "root",
      target: { kind: "node", nodeId: `h:${ptrs.root}` },
      lane: "above",
      color: "var(--color-tn-warning)",
    });
  }

  if (typeof childIdx === "number" && !overlap) {
    out.push({
      id: "child",
      label: "child",
      target: { kind: "node", nodeId: `h:${childIdx}` },
      lane: "below",
      color: "var(--color-tn-cyan)",
    });
  }

  if (typeof swapIdx === "number" && swapIdx !== ptrs.root) {
    out.push({
      id: "swap",
      label: "swap",
      target: { kind: "node", nodeId: `h:${swapIdx}` },
      lane: "below",
      color: "var(--color-tn-magenta)",
    });
  }

  return out;
}

/* ---------- Heap logic ---------- */

function buildMaxHeap(
  arr: number[],
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;

    heapSize: number;
    highlight?: number[];
    focusEdges?: string[];
    ptrs?: { root?: number; child?: number; swapIdx?: number; end?: number };
    meta?: Record<string, any>;
  }) => void,
  edgeIdByPair: Map<string, string>
) {
  push({
    kind: "init",
    codeToken: "hs.init",
    narrationToken: "hs.init",
    heapSize: arr.length,
    highlight: [],
    ptrs: { end: arr.length },
    meta: { heapSize: arr.length },
  });

  for (let i = parent(arr.length - 1); i >= 0; i--) {
    push({
      kind: "compare",
      codeToken: "hs.build_heap",
      narrationToken: "hs.build_heap",
      heapSize: arr.length,
      highlight: [i],
      ptrs: { root: i, end: arr.length },
      meta: { root: i },
    });

    siftDown(arr, i, arr.length, push, arr.length, edgeIdByPair);
  }
}

function siftDown(
  arr: number[],
  start: number,
  heapSize: number,
  push: (args: {
    kind: string;
    codeToken?: string;
    narrationToken?: string;

    heapSize: number;
    highlight?: number[];
    focusEdges?: string[];
    ptrs?: { root?: number; child?: number; swapIdx?: number; end?: number };
    meta?: Record<string, any>;
  }) => void,
  endPtr: number,
  edgeIdByPair: Map<string, string>
) {
  let root = start;

  push({
    kind: "compare",
    codeToken: "hs.sift_start",
    narrationToken: "hs.sift_start",
    heapSize,
    highlight: [root],
    ptrs: { root, end: endPtr },
    meta: { start: root },
  });

  while (true) {
    const leftChild = left(root);
    const hasLeft = leftChild < heapSize;

    push({
      kind: "guard",
      codeToken: "hs.loop_check",
      narrationToken: "hs.loop_check",
      heapSize,
      highlight: hasLeft ? [root, leftChild] : [root],
      focusEdges: hasLeft ? [edgeIdByPair.get(`${root}->${leftChild}`)!] : undefined,
      ptrs: { root, child: hasLeft ? leftChild : undefined, end: endPtr },
      meta: { leftChild, heapSize, hasLeft },
    });

    if (!hasLeft) return;

    const rightChild = leftChild + 1;
    const hasRight = rightChild < heapSize;

    let swapIdx = root;

    push({
      kind: "compare",
      codeToken: "hs.pick_left",
      narrationToken: "hs.pick_left",
      heapSize,
      highlight: [root, leftChild],
      focusEdges: [edgeIdByPair.get(`${root}->${leftChild}`)!],
      ptrs: { root, child: leftChild, swapIdx, end: endPtr },
      meta: { root, leftChild },
    });

    if (arr[leftChild] > arr[swapIdx]) {
      swapIdx = leftChild;

      push({
        kind: "select",
        codeToken: "hs.choose_swap_left",
        narrationToken: "hs.choose_swap_left",
        heapSize,
        highlight: [swapIdx],
        focusEdges: [edgeIdByPair.get(`${root}->${leftChild}`)!],
        ptrs: { root, child: leftChild, swapIdx, end: endPtr },
        meta: { swapIdx },
      });
    }

    push({
      kind: "guard",
      codeToken: "hs.has_right",
      narrationToken: "hs.has_right",
      heapSize,
      highlight: hasRight ? [leftChild, rightChild] : [leftChild],
      focusEdges: hasRight ? [edgeIdByPair.get(`${root}->${rightChild}`)!] : undefined,
      ptrs: { root, child: hasRight ? rightChild : leftChild, swapIdx, end: endPtr },
      meta: { rightChild, heapSize, hasRight },
    });

    if (hasRight) {
      push({
        kind: "compare",
        codeToken: "hs.pick_right",
        narrationToken: "hs.pick_right",
        heapSize,
        highlight: [swapIdx, rightChild],
        focusEdges: [edgeIdByPair.get(`${root}->${rightChild}`)!],
        ptrs: { root, child: rightChild, swapIdx, end: endPtr },
        meta: { swapIdx, rightChild },
      });

      if (arr[rightChild] > arr[swapIdx]) {
        swapIdx = rightChild;

        push({
          kind: "select",
          codeToken: "hs.choose_swap_right",
          narrationToken: "hs.choose_swap_right",
          heapSize,
          highlight: [swapIdx],
          focusEdges: [edgeIdByPair.get(`${root}->${rightChild}`)!],
          ptrs: { root, child: rightChild, swapIdx, end: endPtr },
          meta: { swapIdx },
        });
      }
    }

    if (swapIdx === root) {
      push({
        kind: "return",
        codeToken: "hs.keep",
        narrationToken: "hs.keep",
        heapSize,
        highlight: [root],
        ptrs: { root, end: endPtr },
        meta: { root, heapSize },
      });
      return;
    }

    const a = arr[root];
    const b = arr[swapIdx];
    swap(arr, root, swapIdx);

    // focus the edge we actually traversed (root -> swapIdx)
    push({
      kind: "swap",
      codeToken: "hs.swap",
      narrationToken: "hs.swap",
      heapSize,
      highlight: [root, swapIdx],
      focusEdges: [edgeIdByPair.get(`${root}->${swapIdx}`)!],
      ptrs: { root, swapIdx, end: endPtr },
      meta: { a, b, root, swapIdx },
    });

    root = swapIdx;
  }
}

function parent(i: number) {
  return Math.floor((i - 1) / 2);
}

function left(i: number) {
  return 2 * i + 1;
}

function swap(arr: number[], i: number, j: number) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

/* ---------- authored endpoints for heap edges ---------- */

// Grid units: heap nodes are 1x1 cells centered at (x,y)
// radius ~0.5 in grid coords. Tune EDGE_GAP for spacing.
const NODE_RADIUS = 0.5;
const EDGE_GAP = 0.1;

function edgeEndpoint(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;

  const offset = NODE_RADIUS + EDGE_GAP;

  // avoid overshoot on short edges
  const rr = Math.min(offset, Math.max(0, len / 2 - 0.01));

  return {
    x: from.x + (dx / len) * rr,
    y: from.y + (dy / len) * rr,
  };
}
