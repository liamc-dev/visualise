// src/generators/algorithms/machine-learning/k-means/kmeans-layout.ts

/** Grid coordinates for scatter plot + parameter display. */

import type { TraceTone } from "../../../../types/trace-types";

/** Scatter plot area: reuse same region as linear regression. */
export const PLOT_X0 = 1;
export const PLOT_X1 = 11;
export const PLOT_Y0 = 2;
export const PLOT_Y1 = 11;

/** Parameter row below the plot. */
export const PARAM_Y_LABEL = 12.65;
export const PARAM_Y = 13;
export const PARAM_X = [2, 6, 10] as const;
export const PARAM_LABELS = ["k", "iter", "changes"] as const;

/** Centroid coordinate row below params. */
export const CENTROID_ROW_LABEL_Y = 15.15;
export const CENTROID_ROW_Y = 15.5;
/** Distance row (visible during assignment). */
export const DIST_ROW_LABEL_Y = 16.15;
export const DIST_ROW_Y = 16.5;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 16 };

/** Algorithm constants. */
export const K = 3;
export const MAX_ITERATIONS = 15;
/** Iterations with per-point / per-centroid detail frames. */
export const DETAILED_ITERATIONS = 3;

/** Tone per cluster index. */
export const CLUSTER_TONES: TraceTone[] = ["accent", "cyan", "warning"];

/** Lookup cluster tone, falling back to neutral. */
export function clusterTone(j: number): TraceTone {
  return CLUSTER_TONES[j] ?? "neutral";
}

export type ScaledPoint = { x: number; y: number };

/** Scale raw data points into grid coordinates. */
export function scalePoints(
  pairs: { x: number; y: number }[],
): ScaledPoint[] {
  const xs = pairs.map((p) => p.x);
  const ys = pairs.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  return pairs.map((p) => ({
    x: PLOT_X0 + ((p.x - xMin) / xRange) * (PLOT_X1 - PLOT_X0),
    y: PLOT_Y0 + (1 - (p.y - yMin) / yRange) * (PLOT_Y1 - PLOT_Y0),
  }));
}
