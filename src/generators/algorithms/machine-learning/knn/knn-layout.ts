// src/generators/algorithms/machine-learning/knn/knn-layout.ts

/** Grid coordinates for KNN scatter plot + parameter display. */

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
export const PARAM_LABELS = ["k", "query", "acc"] as const;

/** Persistent pred[] + y[] rows below scatter plot. */
export const PRED_IDX_Y = 15.65;
export const PRED_Y = 16;
export const ACTUAL_Y = 16.5;

/** Neighbor ranking row (transient, detailed queries only). */
export const NEIGHBOR_LABEL_Y = 17.15;
export const NEIGHBOR_ROW_Y = 17.5;
export const DIST_ROW_Y = 18;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 19 };

/** Full per-distance detail for first N queries. */
export const DETAILED_QUERIES = 3;

/** Tone per class: class 0 = cyan, class 1 = warning (matches logreg). */
const CLASS_TONES: TraceTone[] = ["cyan", "warning"];
export function classTone(label: number): TraceTone {
  return CLASS_TONES[label] ?? "neutral";
}
