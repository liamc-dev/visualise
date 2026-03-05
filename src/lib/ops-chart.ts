// Reusable operation counter + chart overlay for sorting algorithms.
// Tracks cumulative comparisons and builds an anchorRight linechart with a reference curve.

import type { TraceOverlay } from "../types/trace-types";

const CHART_X = 0.25;
const CHART_Y = -0.5;
const CHART_WIDTH = 4;
const CHART_HEIGHT = 2.5;
const REF_STEPS = 20;

type RefCurve = {
  /** Maps t ∈ [0,1] to expected cumulative ops at that fraction of total steps */
  shape: (t: number) => number;
  /** Total worst-case operations (scales the shape) */
  total: number;
  /** Legend label (e.g. "n²", "n log n") */
  label: string;
};

export function createOpsChart(ref: RefCurve, yOffset = 0) {
  let ops = 0;
  let epoch = 0;
  const history: { epoch: number; value: number }[] = [];

  function record() {
    ops++;
    history.push({ epoch: epoch++, value: ops });
  }

  function buildRefCurve(): { epoch: number; value: number }[] {
    if (history.length < 2) return [];
    const maxEpoch = history[history.length - 1].epoch;
    const points: { epoch: number; value: number }[] = [];
    for (let i = 0; i <= REF_STEPS; i++) {
      const t = i / REF_STEPS;
      points.push({ epoch: t * maxEpoch, value: ref.shape(t) * ref.total });
    }
    return points;
  }

  function overlay(): TraceOverlay | null {
    if (history.length === 0) return null;
    return {
      kind: "linechart",
      id: "ops-chart",
      x: CHART_X,
      y: CHART_Y + yOffset,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      points: [...history],
      yLabel: "ops",
      refPoints: buildRefCurve(),
      refLabel: ref.label,
      anchorLeft: true,
    };
  }

  return { record, overlay };
}

/** O(n²) reference — bubble sort, selection sort, insertion sort */
export function quadraticRef(n: number): RefCurve {
  return { shape: (t) => t * t, total: n * n, label: "O(n²)" };
}

/** O(n log n) reference — merge sort, quick sort, heap sort */
export function nLogNRef(n: number): RefCurve {
  const logN = Math.ceil(Math.log2(Math.max(n, 2)));
  return { shape: (t) => t * t, total: n * logN, label: "O(n log n)" };
}

/** O(V+E) reference — BFS, Dijkstra */
export function veRef(V: number, E: number): RefCurve {
  return { shape: (t) => t, total: V + E, label: "O(V+E)" };
}

/** O(V·E) reference — Bellman-Ford */
export function veProductRef(V: number, E: number): RefCurve {
  return { shape: (t) => t, total: V * E, label: "O(V·E)" };
}
