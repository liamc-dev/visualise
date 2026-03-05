// src/generators/algorithms/machine-learning/knn/knn-scene.ts
// Builds a TraceScene snapshot for a given KNN algorithm state.

import type {
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import {
  BOUNDS, PARAM_X, PARAM_Y, PARAM_Y_LABEL, PARAM_LABELS,
  PRED_IDX_Y, PRED_Y, ACTUAL_Y,
  NEIGHBOR_LABEL_Y, NEIGHBOR_ROW_Y, DIST_ROW_Y,
  LOSS_CHART_X, LOSS_CHART_Y,
  LOSS_CHART_WIDTH, LOSS_CHART_HEIGHT,
  classTone,
} from "./knn-layout";
import { PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1 } from "../scatter-layout";

export type DataPoint = { x: number; y: number; label: number };

function ptId(i: number) { return `kn:d:${i}`; }
function paramId(k: string) { return `kn:p:${k}`; }

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

export type NeighborInfo = { idx: number; dist: number };

export type SceneOpts = {
  pairs: DataPoint[];
  scaled: { x: number; y: number }[];
  k: number;
  queryIdx: number | null;
  accuracy: number;
  axis: { edges: TraceEdge[]; overlays: TraceOverlay[] };
  /** Index of point being compared for distance. */
  highlightIdx?: number;
  /** Current query point index. */
  queryPoint?: number;
  /** Show dashed edge from query to this training point. */
  distTarget?: number;
  /** Computed neighbor distances (sorted) for current query. */
  neighbors?: NeighborInfo[];
  /** How many neighbors to highlight as "selected". */
  selectedK?: number;
  /** Persistent k-nearest from last completed query. */
  kNearest?: NeighborInfo[];
  /** Predicted class for current query. */
  prediction?: number;
  /** Show all points with result coloring. */
  showResult?: boolean;
  /** Per-point prediction results (true = correct). */
  results?: boolean[];
  calcText?: string;
  accHistory?: { epoch: number; value: number }[];
  opsOverlay?: TraceOverlay | null;
  /** Show all distance edges to training points. */
  showAllDists?: boolean;
  /** Partial distances computed so far. */
  partialDists?: NeighborInfo[];
  /** Per-point predictions (null = not yet classified). */
  predictions: (number | null)[];
  /** Array display horizontal bounds (centered). */
  arrL: number;
  arrR: number;
};

export function buildScene(opts: SceneOpts): TraceScene {
  const {
    pairs, scaled, k, queryIdx, accuracy, axis,
    highlightIdx, queryPoint, distTarget, neighbors,
    selectedK, showResult, results,
    calcText, showAllDists, partialDists,
    arrL, arrR,
  } = opts;
  const n = pairs.length;
  const nodes: TraceNode[] = [];
  const edges: TraceEdge[] = [...axis.edges];
  const overlays: TraceOverlay[] = [...axis.overlays];

  // Decision region shading (k-NN majority vote per pixel)
  overlays.push({
    kind: "knnregion", id: "kn:regions",
    x: PLOT_X0, y: PLOT_Y0,
    width: PLOT_X1 - PLOT_X0 + 1,
    height: PLOT_Y1 - PLOT_Y0 + 1,
    points: scaled.map((s, i) => ({
      x: s.x, y: s.y, tone: classTone(pairs[i].label),
    })),
    k,
  });

  // Parameter cells: k, query, accuracy
  const pv = [
    String(k),
    queryIdx != null ? String(queryIdx) : "\u2013",
    fmt(accuracy * 100, 1) + "%",
  ];
  for (let i = 0; i < 3; i++) {
    const label = PARAM_LABELS[i];
    nodes.push({
      id: paramId(label), kind: "cell",
      pos: { x: PARAM_X[i], y: PARAM_Y },
      meta: {
        value: pv[i],
        tone: (i === 2 && showResult ? "accent" : "neutral") as TraceTone,
        weight: (i === 2 && showResult ? 1 : 0) as 0 | 1,
      },
    });
  }

  // Parameter labels
  for (let i = 0; i < 3; i++) {
    overlays.push({
      kind: "caption", id: `kn:lbl:${PARAM_LABELS[i]}`,
      x: PARAM_X[i], y: PARAM_Y_LABEL,
      text: PARAM_LABELS[i], emphasis: "faint",
    });
  }

  // Persistent pred[] + y[] rows (like logreg's ŷ[] vs y[])
  {
    const arrStep = n > 1 ? (arrR - arrL) / (n - 1) : 0;
    const arrX = (i: number) => arrL + i * arrStep;
    overlays.push(
      { kind: "caption", id: "kn:pred-lbl",
        x: arrL - 1.5, y: PRED_Y, text: "pred[]", emphasis: "soft" },
      { kind: "caption", id: "kn:act-lbl",
        x: arrL - 1.5, y: ACTUAL_Y, text: "y[]", emphasis: "faint" },
    );
    for (let i = 0; i < n; i++) {
      const pred = opts.predictions[i];
      const actual = pairs[i].label;
      const isCorrect = pred != null && pred === actual;
      const isWrong = pred != null && pred !== actual;
      overlays.push(
        { kind: "caption", id: `kn:pidx:${i}`, x: arrX(i), y: PRED_IDX_Y,
          text: String(i), emphasis: "faint", opacity: 0.4, align: "center" },
        { kind: "caption", id: `kn:pred:${i}`, x: arrX(i), y: PRED_Y,
          text: pred != null ? String(pred)
            : queryPoint === i ? "?" : "\u2013",
          emphasis: pred != null || queryPoint === i ? "active" : "faint",
          align: "center",
          color: isCorrect ? `rgb(var(--tn-${classTone(pred)}))`
            : isWrong ? `rgb(var(--tn-danger))`
            : queryPoint === i ? `rgb(var(--tn-magenta))` : undefined },
        { kind: "caption", id: `kn:act:${i}`, x: arrX(i), y: ACTUAL_Y,
          text: String(actual), emphasis: "faint", align: "center",
          color: `rgb(var(--tn-${classTone(actual)}))` },
      );
    }
  }

  // Data points as colored digit captions
  for (let i = 0; i < n; i++) {
    const isQuery = i === queryPoint;
    const isHighlight = i === highlightIdx;
    const isDistTarget = i === distTarget;
    const isSelected = selectedK != null && neighbors?.slice(0, selectedK)
      .some((nb) => nb.idx === i);

    let tone: TraceTone;
    if (showResult && results) {
      tone = results[i] ? classTone(pairs[i].label) : "danger";
    } else if (isQuery) {
      tone = "magenta";
    } else if (isSelected) {
      tone = "accent";
    } else if (isDistTarget || isHighlight) {
      tone = "accent";
    } else {
      tone = classTone(pairs[i].label);
    }

    const emphasis = isQuery || isHighlight || isDistTarget || isSelected
      ? "active" as const : "soft" as const;

    overlays.push({
      kind: "caption", id: ptId(i),
      x: scaled[i].x + 0.5, y: scaled[i].y + 0.5,
      text: String(i), emphasis, align: "center",
      color: `rgb(var(--tn-${tone}))`,
    });
  }

  // Distance edge from query to a specific training point
  if (queryPoint != null && distTarget != null) {
    edges.push({
      id: `kn:dist:${queryPoint}:${distTarget}`,
      from: ptId(queryPoint), to: ptId(distTarget), kind: "distance",
      meta: {
        fromPt: { x: scaled[queryPoint].x, y: scaled[queryPoint].y },
        toPt: { x: scaled[distTarget].x, y: scaled[distTarget].y },
        tone: "accent", weight: 0, dashed: true, arrow: false, opacity: 0.6,
      },
    });
  }

  // Show all distance edges (during sort/select)
  if (showAllDists && queryPoint != null && neighbors) {
    const showCount = selectedK ?? neighbors.length;
    for (let ni = 0; ni < showCount && ni < neighbors.length; ni++) {
      const nb = neighbors[ni];
      const isInK = selectedK != null && ni < selectedK;
      edges.push({
        id: `kn:nb:${queryPoint}:${nb.idx}`,
        from: ptId(queryPoint), to: ptId(nb.idx), kind: "distance",
        meta: {
          fromPt: { x: scaled[queryPoint].x, y: scaled[queryPoint].y },
          toPt: { x: scaled[nb.idx].x, y: scaled[nb.idx].y },
          tone: isInK ? "accent" : "muted", weight: isInK ? 1 : 0,
          dashed: true, arrow: false, opacity: isInK ? 0.7 : 0.25,
        },
      });
    }
  }

  // Partial distance edges (during dist computation)
  if (queryPoint != null && partialDists && !showAllDists) {
    for (const pd of partialDists) {
      if (pd.idx === distTarget) continue; // already shown above
      edges.push({
        id: `kn:pd:${queryPoint}:${pd.idx}`,
        from: ptId(queryPoint), to: ptId(pd.idx), kind: "distance",
        meta: {
          fromPt: { x: scaled[queryPoint].x, y: scaled[queryPoint].y },
          toPt: { x: scaled[pd.idx].x, y: scaled[pd.idx].y },
          tone: "muted", weight: 0,
          dashed: true, arrow: false, opacity: 0.2,
        },
      });
    }
  }

  // Persistent k-nearest neighbor rows (aligned with pred/y columns)
  // Use active neighbors if available, otherwise last completed query's neighbors
  const displayNb = selectedK != null && neighbors
    ? neighbors.slice(0, selectedK)
    : opts.kNearest;
  if (displayNb && displayNb.length > 0) {
    const nbCount = displayNb.length;
    const nbStep = nbCount > 1 ? (arrR - arrL) / (nbCount - 1) : 0;
    const nbX = (i: number) => arrL + i * nbStep;
    overlays.push(
      { kind: "caption", id: "kn:nb-title", x: arrL - 1.5, y: NEIGHBOR_LABEL_Y,
        text: "k nearest", emphasis: "faint" },
      { kind: "caption", id: "kn:nb-lbl", x: arrL - 1.5, y: NEIGHBOR_ROW_Y,
        text: "nb[]", emphasis: "faint" },
      { kind: "caption", id: "kn:dst-lbl", x: arrL - 1.5, y: DIST_ROW_Y,
        text: "dist[]", emphasis: "faint" },
    );
    for (let ni = 0; ni < nbCount; ni++) {
      const nb = displayNb[ni];
      const isActive = selectedK != null;
      overlays.push(
        { kind: "caption", id: `kn:nblbl:${ni}`, x: nbX(ni), y: NEIGHBOR_ROW_Y,
          text: `pt${nb.idx}`, emphasis: isActive ? "active" : "soft",
          align: "center",
          color: `rgb(var(--tn-${classTone(pairs[nb.idx].label)}))` },
        { kind: "caption", id: `kn:nbdist:${ni}`, x: nbX(ni), y: DIST_ROW_Y,
          text: fmt(nb.dist, 2), emphasis: isActive ? "active" : "soft",
          align: "center" },
      );
    }
  }

  // Calc overlay
  if (calcText) {
    overlays.push({
      kind: "caption", id: "kn:calc",
      x: 6, y: 0.5, text: calcText,
      emphasis: "active", align: "center",
    });
  }

  // Accuracy chart
  if (opts.accHistory && opts.accHistory.length > 0) {
    overlays.push({
      kind: "linechart", id: "kn:acc-chart",
      x: LOSS_CHART_X, y: LOSS_CHART_Y,
      width: LOSS_CHART_WIDTH, height: LOSS_CHART_HEIGHT,
      points: opts.accHistory.map((p) => ({ ...p })), yLabel: "acc",
    });
  }

  // Ops chart
  if (opts.opsOverlay) {
    overlays.push(opts.opsOverlay);
  }

  const bounds = {
    ...BOUNDS,
    minX: Math.min(BOUNDS.minX, arrL - 1.5),
    maxX: Math.max(BOUNDS.maxX, arrR + 1.5),
  };

  return { nodes, edges, overlays, bounds };
}
