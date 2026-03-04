// src/generators/algorithms/machine-learning/k-means/kmeans-trace.ts

import type { TraceFrame, TraceScene } from "../../../../types/trace-types";
import {
  PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1,
  K, MAX_ITERATIONS, DETAILED_ITERATIONS,
  scalePoints,
} from "./kmeans-layout";
import { buildAxisOverlays } from "../../../../lib/axis-utils";
import { buildScene, type DataPoint } from "./kmeans-scene";

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

function euclidean(a: DataPoint, b: DataPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Pick k random initial centroids (seeded for deterministic traces). */
function pickInitialCentroids(pairs: DataPoint[], k: number): DataPoint[] {
  const n = pairs.length;
  const idx = Array.from({ length: n }, (_, i) => i);
  let seed = 42;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const j = seed % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).map((i) => ({ ...pairs[i] }));
}

export function kmeansTrace(input: number[]): TraceFrame[] {
  const pairs: DataPoint[] = [];
  for (let i = 0; i < input.length; i += 2) {
    pairs.push({ x: input[i], y: input[i + 1] });
  }
  const n = pairs.length;
  if (n < K) return [];

  const scaled = scalePoints(pairs);
  const xs = pairs.map((p) => p.x);
  const ys = pairs.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const axis = buildAxisOverlays({
    plotX0: PLOT_X0, plotX1: PLOT_X1, plotY0: PLOT_Y0, plotY1: PLOT_Y1,
    xMin, xMax, yMin, yMax, prefix: "km:ax",
  });

  const centroids = pickInitialCentroids(pairs, K);
  const assign = new Array<number>(n).fill(-1);
  const frames: TraceFrame[] = [];
  let step = 0;

  function scaleCentroids(c: DataPoint[]): { x: number; y: number }[] {
    return c.map((p) => ({
      x: PLOT_X0 + ((p.x - xMin) / (xMax - xMin || 1)) * (PLOT_X1 - PLOT_X0),
      y: PLOT_Y0 + (1 - (p.y - yMin) / (yMax - yMin || 1)) * (PLOT_Y1 - PLOT_Y0),
    }));
  }

  function push(
    kind: string, token: string, scene: TraceScene,
    meta?: Record<string, unknown>,
  ) {
    frames.push({
      id: `km.${kind}.${step++}`, kind, codeToken: token,
      narrationToken: token, scene, meta,
    });
  }

  const base = { pairs, scaled, axis };
  let scaledCentroids = scaleCentroids(centroids);

  push("data", "km.data",
    buildScene({ ...base, centroids, scaledCentroids, assign, iter: 0, changes: 0 }),
    { n },
  );
  push("init", "km.init",
    buildScene({ ...base, centroids, scaledCentroids, assign, iter: 0, changes: 0 }),
    { k: K },
  );

  let totalChanges = 0;
  for (let iter = 1; iter <= MAX_ITERATIONS; iter++) {
    const isDetailed = iter <= DETAILED_ITERATIONS;

    push("iteration", "km.iteration",
      buildScene({
        ...base, centroids, scaledCentroids, assign,
        iter, changes: totalChanges, showAssignEdges: iter > 1,
      }),
      { iter },
    );

    // --- assign phase ---
    push("assign", "km.assign",
      buildScene({
        ...base, centroids, scaledCentroids, assign,
        iter, changes: 0, showAssignEdges: iter > 1,
      }),
      { iter },
    );

    const changes = isDetailed
      ? assignDetailed(iter)
      : assignSummary();
    totalChanges = changes;

    // --- update phase ---
    const prevScaled = scaleCentroids(centroids.map((c) => ({ ...c })));

    push("update", "km.update",
      buildScene({
        ...base, centroids, scaledCentroids, assign,
        iter, changes, showAssignEdges: true,
      }),
      { iter },
    );

    if (isDetailed) {
      updateDetailed(iter, changes, prevScaled);
    } else {
      updateSummary();
    }
    scaledCentroids = scaleCentroids(centroids);

    push("check", "km.check",
      buildScene({
        ...base, centroids, scaledCentroids, assign,
        iter, changes, showAssignEdges: true,
      }),
      { changes, iter },
    );

    if (changes === 0) break;
  }

  const finalIter = Math.min(
    frames.filter((f) => f.kind === "iteration").length,
    MAX_ITERATIONS,
  );
  push("done", "km.done",
    buildScene({
      ...base, centroids, scaledCentroids, assign,
      iter: finalIter, changes: 0, showAssignEdges: true,
      calcText: `${K} clusters, ${finalIter} iterations`,
    }),
    { k: K, iter: finalIter },
  );

  return frames;

  // ---------- detailed assign: per-point with per-centroid comparisons ----------

  function assignDetailed(iter: number): number {
    let changes = 0;
    for (let i = 0; i < n; i++) {
      const dists: (number | null)[] = new Array<number | null>(K).fill(null);

      push("assign.init", "km.assign.init",
        buildScene({
          ...base, centroids, scaledCentroids, assign,
          iter, changes, highlightIdx: i, showAssignEdges: true,
          calcText: `pt ${i}: nearest = ?, bestD = \u221e`,
          dists: [...dists],
        }),
        { pointIdx: i, iter },
      );

      let nearest = 0;
      let bestD = Infinity;
      for (let j = 0; j < K; j++) {
        const d = euclidean(pairs[i], centroids[j]);
        dists[j] = d;
        const isBest = d < bestD;
        const prevBest = bestD;
        if (isBest) { bestD = d; nearest = j; }

        push("assign.cmp", "km.assign.cmp",
          buildScene({
            ...base, centroids, scaledCentroids, assign,
            iter, changes, highlightIdx: i,
            compareCentroid: j, showAssignEdges: true,
            calcText: isBest
              ? `d(${i}, C${j}) = ${fmt(d)} < ${fmt(prevBest)} \u2192 best`
              : `d(${i}, C${j}) = ${fmt(d)} \u2265 ${fmt(bestD)} \u2192 skip`,
            dists: [...dists], bestDistIdx: nearest,
          }),
          { pointIdx: i, centroidIdx: j, dist: fmt(d), isBest, bestD: fmt(bestD), iter },
        );
      }

      const prev = assign[i];
      const changed = assign[i] !== nearest;
      if (changed) { assign[i] = nearest; changes++; }

      push("assign.update", "km.assign.update",
        buildScene({
          ...base, centroids, scaledCentroids, assign,
          iter, changes, highlightIdx: i, showAssignEdges: true,
          calcText: changed
            ? `pt ${i}: C${prev < 0 ? "?" : prev} \u2192 C${nearest}`
            : `pt ${i}: stays C${nearest}`,
          dists: [...dists], bestDistIdx: nearest,
        }),
        { pointIdx: i, cluster: nearest, prevCluster: prev, changed, changes, iter },
      );
    }
    return changes;
  }

  function assignSummary(): number {
    let changes = 0;
    for (let i = 0; i < n; i++) {
      let nearest = 0;
      let bestD = Infinity;
      for (let j = 0; j < K; j++) {
        const d = euclidean(pairs[i], centroids[j]);
        if (d < bestD) { bestD = d; nearest = j; }
      }
      if (assign[i] !== nearest) { assign[i] = nearest; changes++; }
    }
    return changes;
  }

  // ---------- detailed update: per-centroid with per-member accumulation ----------

  function updateDetailed(
    iter: number, changes: number,
    prevScaled: { x: number; y: number }[],
  ) {
    for (let j = 0; j < K; j++) {
      push("update.init", "km.update.init",
        buildScene({
          ...base, centroids, scaledCentroids, assign,
          iter, changes, highlightCentroid: j, showAssignEdges: true,
          calcText: `C${j}: sx=0, sy=0, cnt=0`,
        }),
        { centroidIdx: j, iter },
      );

      let sx = 0, sy = 0, cnt = 0;
      for (let i = 0; i < n; i++) {
        if (assign[i] !== j) continue;
        sx += pairs[i].x; sy += pairs[i].y; cnt++;

        push("update.acc", "km.update.acc",
          buildScene({
            ...base, centroids, scaledCentroids, assign,
            iter, changes, highlightCentroid: j, highlightIdx: i,
            showAssignEdges: true,
            calcText: `C${j} += pt ${i}: sum=(${fmt(sx, 1)}, ${fmt(sy, 1)}), cnt=${cnt}`,
          }),
          { centroidIdx: j, pointIdx: i, sx: fmt(sx, 1), sy: fmt(sy, 1), cnt, iter },
        );
      }

      if (cnt > 0) centroids[j] = { x: sx / cnt, y: sy / cnt };
      scaledCentroids = scaleCentroids(centroids);

      push("update.mean", "km.update.mean",
        buildScene({
          ...base, centroids, scaledCentroids, assign,
          iter, changes, highlightCentroid: j, showAssignEdges: true,
          prevScaledCentroids: prevScaled,
          calcText: `C${j} = (${fmt(centroids[j].x, 1)}, ${fmt(centroids[j].y, 1)})`,
        }),
        {
          centroidIdx: j, count: cnt,
          cx: fmt(centroids[j].x, 1), cy: fmt(centroids[j].y, 1), iter,
        },
      );
    }
  }

  function updateSummary() {
    for (let j = 0; j < K; j++) {
      let sx = 0, sy = 0, cnt = 0;
      for (let i = 0; i < n; i++) {
        if (assign[i] === j) { sx += pairs[i].x; sy += pairs[i].y; cnt++; }
      }
      if (cnt > 0) centroids[j] = { x: sx / cnt, y: sy / cnt };
    }
  }
}
