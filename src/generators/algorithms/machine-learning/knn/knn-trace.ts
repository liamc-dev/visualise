// src/generators/algorithms/machine-learning/knn/knn-trace.ts

import type { TraceFrame, TraceScene } from "../../../../types/trace-types";
import {
  PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1,
  DETAILED_QUERIES, scalePoints,
} from "./knn-layout";
import { buildAxisOverlays } from "../../../../lib/axis-utils";
import { createOpsChart, quadraticRef } from "../../../../lib/ops-chart";
import { buildScene, type NeighborInfo } from "./knn-scene";
import type { DataPoint } from "./knn-scene";

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function knnTrace(input: number[]): TraceFrame[] {
  // input[0] = epochs (unused), input[1] = lr (unused), input[2] = k
  const rawK = input.length > 2 ? Math.round(input[2]) : 3;
  const data = input.slice(3);
  const rawPairs: { x: number; y: number }[] = [];
  for (let i = 0; i < data.length; i += 2) {
    rawPairs.push({ x: data[i], y: data[i + 1] });
  }
  const n = rawPairs.length;
  if (n < 2) return [];

  const k = Math.max(1, Math.min(rawK, Math.min(9, n - 1)));

  // Auto-label: sort by x+y, lower half = class 0, upper half = class 1
  const indexed = rawPairs.map((p, i) => ({ ...p, origIdx: i, sum: p.x + p.y }));
  indexed.sort((a, b) => a.sum - b.sum);
  const mid = Math.floor(n / 2);
  const labels = new Array<number>(n);
  for (let i = 0; i < indexed.length; i++) {
    labels[indexed[i].origIdx] = i < mid ? 0 : 1;
  }

  const pairs: DataPoint[] = rawPairs.map((p, i) => ({
    x: p.x, y: p.y, label: labels[i],
  }));
  const scaled = scalePoints(rawPairs);

  const xs = rawPairs.map((p) => p.x);
  const ys = rawPairs.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const axis = buildAxisOverlays({
    plotX0: PLOT_X0, plotX1: PLOT_X1, plotY0: PLOT_Y0, plotY1: PLOT_Y1,
    xMin, xMax, yMin, yMax, prefix: "kn:ax",
  });

  // Array display layout (matches logreg)
  const arrWidth = Math.max((n - 1) * 1.2, 8);
  const arrCenter = (-1 + 13) / 2; // (BOUNDS.minX + BOUNDS.maxX) / 2
  const arrL = arrCenter - arrWidth / 2;
  const arrR = arrCenter + arrWidth / 2;

  const opsChart = createOpsChart(quadraticRef(n));
  const frames: TraceFrame[] = [];
  let step = 0;
  let correct = 0;
  const accHistory: { epoch: number; value: number }[] = [];
  const results = new Array<boolean>(n).fill(false);
  const predictions = new Array<number | null>(n).fill(null);
  let lastKNearest: NeighborInfo[] | undefined;

  function push(
    kind: string, token: string, scene: TraceScene,
    meta?: Record<string, unknown>, narration?: string,
  ) {
    frames.push({
      id: `kn.${kind}.${step++}`, kind, codeToken: token,
      narrationToken: narration ?? token, scene, meta,
    });
  }

  const base = {
    pairs, scaled, axis, k, accHistory, arrL, arrR, predictions,
  };
  /** Spread into buildScene — includes persistent kNearest. */
  const ctx = () => ({ ...base, kNearest: lastKNearest });
  const runAcc = (qi: number) => qi > 0 ? correct / qi : 0;

  // --- data: show labeled points ---
  push("data", "knn.data",
    buildScene({
      ...ctx(), queryIdx: null, accuracy: 0,
      opsOverlay: opsChart.overlay(),
    }),
    { n });

  // --- label: show auto-labeling ---
  push("label", "knn.label",
    buildScene({
      ...ctx(), queryIdx: null, accuracy: 0,
      calcText: `${n} points, auto-labeled by x+y`,
      opsOverlay: opsChart.overlay(),
    }),
    { n });

  // --- leave-one-out loop ---
  for (let qi = 0; qi < n; qi++) {
    const isDetailed = qi < DETAILED_QUERIES;

    if (isDetailed) {
      // --- query: highlight query point ---
      push("query", "knn.query",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi,
          calcText: `query = point ${qi}`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, n });

      // --- dist.init: initialize distance list ---
      push("dist.init", "knn.dist.init",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi,
          calcText: "dists = []",
          opsOverlay: opsChart.overlay(),
        }),
        { qi, n });

      // --- dist.calc: compute distance to each training point ---
      const dists: NeighborInfo[] = [];
      for (let j = 0; j < n; j++) {
        if (j === qi) continue;
        const d = euclidean(rawPairs[qi], rawPairs[j]);
        opsChart.record();
        dists.push({ idx: j, dist: d });

        push("dist.calc", "knn.dist.calc",
          buildScene({
            ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
            queryPoint: qi, distTarget: j,
            partialDists: dists.slice(0, -1),
            calcText: `d(${qi}, ${j}) = ${fmt(d)}`,
            opsOverlay: opsChart.overlay(),
          }),
          { qi, j, dist: fmt(d), n });
      }

      // --- sort ---
      dists.sort((a, b) => a.dist - b.dist);

      push("sort", "knn.sort",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi, neighbors: dists, showAllDists: true,
          calcText: `sorted ${dists.length} distances`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, n });

      // --- select k nearest ---
      const nearest = dists.slice(0, k);

      push("select", "knn.select",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi, neighbors: dists, selectedK: k,
          showAllDists: true,
          calcText: `k=${k} nearest neighbors selected`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, k, n });

      // --- vote: count class votes ---
      const voteCounts: [number, number] = [0, 0];
      for (const nb of nearest) {
        voteCounts[pairs[nb.idx].label]++;
      }

      push("vote", "knn.vote",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi, neighbors: dists, selectedK: k,
          showAllDists: true,
          calcText: `votes: class 0 = ${voteCounts[0]}, class 1 = ${voteCounts[1]}`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, votes0: voteCounts[0], votes1: voteCounts[1], n });

      // --- decide: majority vote result ---
      const predicted = voteCounts[1] > voteCounts[0] ? 1 : 0;

      push("decide", "knn.decide",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: runAcc(qi),
          queryPoint: qi, neighbors: dists, selectedK: k,
          showAllDists: true,
          prediction: predicted,
          calcText: `predicted = class ${predicted}`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, predicted, votes0: voteCounts[0], votes1: voteCounts[1], n });

      // --- predict: check correctness ---
      predictions[qi] = predicted;
      lastKNearest = nearest;
      const isCorrect = predicted === pairs[qi].label;
      if (isCorrect) correct++;
      results[qi] = isCorrect;
      const acc = correct / (qi + 1);
      accHistory.push({ epoch: qi + 1, value: acc });

      push("predict", "knn.predict",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: acc,
          queryPoint: qi, neighbors: dists, selectedK: k,
          showAllDists: true,
          prediction: predicted,
          calcText: isCorrect
            ? `predict ${predicted} = actual ${pairs[qi].label} \u2713`
            : `predict ${predicted} \u2260 actual ${pairs[qi].label} \u2717`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, predicted, actual: pairs[qi].label, correct: isCorrect,
          acc: fmt(acc * 100, 1), n });

    } else {
      // --- batch: non-detailed queries ---
      const dists: NeighborInfo[] = [];
      for (let j = 0; j < n; j++) {
        if (j === qi) continue;
        const d = euclidean(rawPairs[qi], rawPairs[j]);
        opsChart.record();
        dists.push({ idx: j, dist: d });
      }
      dists.sort((a, b) => a.dist - b.dist);

      const nearest = dists.slice(0, k);
      const voteCounts: [number, number] = [0, 0];
      for (const nb of nearest) {
        voteCounts[pairs[nb.idx].label]++;
      }
      const predicted = voteCounts[1] > voteCounts[0] ? 1 : 0;
      predictions[qi] = predicted;
      lastKNearest = nearest;
      const isCorrect = predicted === pairs[qi].label;
      if (isCorrect) correct++;
      results[qi] = isCorrect;
      const acc = correct / (qi + 1);
      accHistory.push({ epoch: qi + 1, value: acc });

      push("batch", "knn.predict",
        buildScene({
          ...ctx(), queryIdx: qi, accuracy: acc,
          queryPoint: qi,
          calcText: isCorrect
            ? `q${qi}: predict ${predicted} = actual ${pairs[qi].label} \u2713  acc=${fmt(acc * 100, 1)}%`
            : `q${qi}: predict ${predicted} \u2260 actual ${pairs[qi].label} \u2717  acc=${fmt(acc * 100, 1)}%`,
          opsOverlay: opsChart.overlay(),
        }),
        { qi, predicted, actual: pairs[qi].label, correct: isCorrect,
          acc: fmt(acc * 100, 1), n },
        "knn.batch");
    }
  }

  // --- done: final accuracy ---
  const finalAcc = correct / n;
  push("done", "knn.done",
    buildScene({
      ...ctx(), queryIdx: null, accuracy: finalAcc,
      showResult: true, results,
      calcText: `LOO accuracy: ${correct}/${n} (${fmt(finalAcc * 100, 1)}%)`,
      opsOverlay: opsChart.overlay(),
    }),
    { correct, n, accuracy: fmt(finalAcc * 100, 1) });

  return frames;
}
