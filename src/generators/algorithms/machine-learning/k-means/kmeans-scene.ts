// src/generators/algorithms/machine-learning/k-means/kmeans-scene.ts
// Builds a TraceScene snapshot for a given K-Means algorithm state.

import type {
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import {
  BOUNDS, PARAM_X, PARAM_Y, PARAM_Y_LABEL, PARAM_LABELS,
  CENTROID_ROW_LABEL_Y, CENTROID_ROW_Y,
  DIST_ROW_LABEL_Y, DIST_ROW_Y,
  LOSS_CHART_X, LOSS_CHART_Y,
  LOSS_CHART_WIDTH, LOSS_CHART_HEIGHT,
  K, clusterTone,
} from "./kmeans-layout";

export type DataPoint = { x: number; y: number };

function ptId(i: number) { return `km:d:${i}`; }
function centId(j: number) { return `km:c:${j}`; }
function assignEdgeId(i: number) { return `km:a:${i}`; }
function paramId(k: string) { return `km:p:${k}`; }

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

export type SceneOpts = {
  pairs: DataPoint[];
  scaled: { x: number; y: number }[];
  centroids: DataPoint[];
  scaledCentroids: { x: number; y: number }[];
  assign: number[];
  iter: number;
  changes: number;
  axis: { edges: TraceEdge[]; overlays: TraceOverlay[] };
  highlightIdx?: number;
  highlightCentroid?: number;
  /** Draw comparison edge from highlightIdx to this centroid. */
  compareCentroid?: number;
  prevScaledCentroids?: { x: number; y: number }[];
  calcText?: string;
  showAssignEdges?: boolean;
  /** Distances from current point to each centroid (assign phase). */
  dists?: (number | null)[];
  /** Index of nearest centroid so far (highlights dist row cell). */
  bestDistIdx?: number;
  changesHistory?: { epoch: number; value: number }[];
};

export function buildScene(opts: SceneOpts): TraceScene {
  const {
    pairs, scaled, centroids, scaledCentroids, assign,
    iter, changes, axis, highlightIdx, highlightCentroid, compareCentroid,
    prevScaledCentroids, calcText, showAssignEdges, dists, bestDistIdx,
  } = opts;
  const n = pairs.length;
  const nodes: TraceNode[] = [];
  const edges: TraceEdge[] = [...axis.edges];
  const overlays: TraceOverlay[] = [...axis.overlays];

  // Parameter cells
  const pv = [String(K), String(iter), String(changes)];
  for (let i = 0; i < 3; i++) {
    const label = PARAM_LABELS[i];
    nodes.push({
      id: paramId(label), kind: "cell",
      pos: { x: PARAM_X[i], y: PARAM_Y },
      meta: { value: pv[i], tone: "neutral" as TraceTone, weight: 0 as 0 | 1 },
    });
  }

  // Parameter labels
  for (let i = 0; i < 3; i++) {
    overlays.push({
      kind: "caption", id: `km:lbl:${PARAM_LABELS[i]}`,
      x: PARAM_X[i], y: PARAM_Y_LABEL,
      text: PARAM_LABELS[i], emphasis: "faint",
    });
  }

  // Data points as colored digit captions on scatter plot (no cell nodes)
  for (let i = 0; i < n; i++) {
    const a = assign[i];
    const tone: TraceTone = a >= 0 ? clusterTone(a) : "neutral";
    const isHl = i === highlightIdx;
    overlays.push({
      kind: "caption", id: ptId(i),
      x: scaled[i].x + 0.5, y: scaled[i].y + 0.5,
      text: String(i),
      emphasis: isHl ? "active" : "soft",
      align: "center",
      color: a >= 0 ? `rgb(var(--tn-${tone}))` : undefined,
    });
  }

  // Centroids
  for (let j = 0; j < centroids.length; j++) {
    const sc = scaledCentroids[j];
    const isHl = j === highlightCentroid;
    nodes.push({
      id: centId(j), kind: "cell",
      pos: { x: sc.x, y: sc.y },
      meta: { value: `C${j}`, tone: clusterTone(j), weight: 1 as 0 | 1, opacity: 0.35 },
    });
    if (isHl) {
      overlays.push({
        kind: "caption", id: `km:chl:${j}`,
        x: sc.x + 0.5, y: sc.y - 0.4,
        text: `(${fmt(centroids[j].x, 1)}, ${fmt(centroids[j].y, 1)})`,
        emphasis: "active", align: "center",
      });
    }
  }

  // Comparison edge (point → centroid being tested)
  if (compareCentroid != null && highlightIdx != null) {
    const pi = highlightIdx;
    const cj = compareCentroid;
    const sc = scaledCentroids[cj];
    edges.push({
      id: `km:cmp:${pi}:${cj}`, from: ptId(pi), to: centId(cj), kind: "compare",
      meta: {
        fromPt: { x: scaled[pi].x, y: scaled[pi].y },
        toPt: { x: sc.x, y: sc.y },
        tone: clusterTone(cj), weight: 1,
        dashed: true, arrow: false, opacity: 0.6,
      },
    });
  }

  // Assignment edges
  if (showAssignEdges) {
    for (let i = 0; i < n; i++) {
      const a = assign[i];
      if (a < 0) continue;
      const sc = scaledCentroids[a];
      const toneKey = clusterTone(a) === "accent" ? "accent"
        : clusterTone(a) === "cyan" ? "info" : "warning";
      edges.push({
        id: assignEdgeId(i), from: ptId(i), to: centId(a), kind: "assign",
        meta: {
          fromPt: { x: scaled[i].x, y: scaled[i].y },
          toPt: { x: sc.x, y: sc.y },
          color: `rgb(var(--tn-${toneKey}))`,
          opacity: 0.2, arrow: false,
          tone: clusterTone(a), weight: 0,
        },
      });
    }
  }

  // Centroid movement edges
  if (prevScaledCentroids) {
    for (let j = 0; j < centroids.length; j++) {
      const prev = prevScaledCentroids[j];
      const curr = scaledCentroids[j];
      if (Math.abs(prev.x - curr.x) > 0.01 || Math.abs(prev.y - curr.y) > 0.01) {
        edges.push({
          id: `km:mv:${j}`, from: centId(j), to: centId(j), kind: "movement",
          meta: {
            fromPt: { x: prev.x, y: prev.y },
            toPt: { x: curr.x, y: curr.y },
            tone: clusterTone(j), weight: 0,
            dashed: true, arrow: true, opacity: 0.5,
          },
        });
      }
    }
  }

  // Centroid coordinate row (captions only)
  for (let j = 0; j < centroids.length; j++) {
    overlays.push({
      kind: "caption", id: `km:crlbl:${j}`,
      x: PARAM_X[j], y: CENTROID_ROW_LABEL_Y,
      text: `C${j}`, emphasis: "soft",
    });
    overlays.push({
      kind: "caption", id: `km:cr:${j}`,
      x: PARAM_X[j], y: CENTROID_ROW_Y,
      text: `(${fmt(centroids[j].x, 1)}, ${fmt(centroids[j].y, 1)})`,
      emphasis: j === highlightCentroid ? "active" : "soft",
    });
  }

  // Distance row (captions, during assignment)
  if (dists) {
    for (let j = 0; j < K; j++) {
      overlays.push({
        kind: "caption", id: `km:drlbl:${j}`,
        x: PARAM_X[j], y: DIST_ROW_LABEL_Y,
        text: `d${j}`, emphasis: "soft",
      });
      const d = dists[j];
      const isBest = j === bestDistIdx;
      overlays.push({
        kind: "caption", id: `km:dr:${j}`,
        x: PARAM_X[j], y: DIST_ROW_Y,
        text: d != null ? fmt(d) : "\u2013",
        emphasis: d != null ? (isBest ? "active" : "soft") : "faint",
      });
    }
  }

  // Calc overlay
  if (calcText) {
    overlays.push({
      kind: "caption", id: "km:calc",
      x: 6, y: 0.5, text: calcText,
      emphasis: "active", align: "center",
    });
  }

  // Changes history chart
  if (opts.changesHistory && opts.changesHistory.length > 0) {
    overlays.push({
      kind: "linechart", id: "km:loss-chart",
      x: LOSS_CHART_X, y: LOSS_CHART_Y,
      width: LOSS_CHART_WIDTH, height: LOSS_CHART_HEIGHT,
      points: opts.changesHistory.map((p) => ({ ...p })), yLabel: "changes",
    });
  }

  return { nodes, edges, overlays, bounds: BOUNDS };
}
