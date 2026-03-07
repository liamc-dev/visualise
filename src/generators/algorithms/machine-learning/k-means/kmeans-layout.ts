// src/generators/algorithms/machine-learning/k-means/kmeans-layout.ts

/** Grid coordinates for scatter plot + parameter display. */

import type { TraceTone } from "../../../../types/trace-types";

export {
  PLOT_X0,
  PLOT_X1,
  PLOT_Y0,
  PLOT_Y1,
  PARAM_Y_LABEL,
  PARAM_Y,
  LOSS_CHART_X,
  LOSS_CHART_Y,
  LOSS_CHART_WIDTH,
  LOSS_CHART_HEIGHT,
  scalePoints,
} from "../scatter-layout";
export type { ScaledPoint } from "../scatter-layout";

export const PARAM_X = [2, 6, 10] as const;
export const PARAM_LABELS = ["k", "iter", "changes"] as const;

/** Centroid coordinate row below params. */
export const CENTROID_ROW_LABEL_Y = 16.15;
export const CENTROID_ROW_Y = 16.5;
/** Distance row (visible during assignment). */
export const DIST_ROW_LABEL_Y = 17.15;
export const DIST_ROW_Y = 17.5;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 16 };

/** Algorithm constants. */
export const MAX_ITERATIONS = 15;
/** Iterations with per-point / per-centroid detail frames. */
export const DETAILED_ITERATIONS = 3;

/** Tone per cluster index (supports up to 6 clusters). */
export const CLUSTER_TONES: TraceTone[] = ["magenta", "cyan", "warning", "accent", "info", "danger"];

/** Lookup cluster tone, falling back to neutral. */
export function clusterTone(j: number): TraceTone {
  return CLUSTER_TONES[j] ?? "neutral";
}
