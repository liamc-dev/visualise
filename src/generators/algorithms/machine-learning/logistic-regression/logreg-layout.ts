// src/generators/algorithms/machine-learning/logistic-regression/logreg-layout.ts

/** Grid coordinates for the scatter plot + parameter display. */

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
  dataXToGrid,
  dataYToGrid,
} from "../scatter-layout";
export type { ScaledPoint } from "../scatter-layout";

export const PARAM_X = [2, 5, 8, 11] as const;
export const PARAM_LABELS = ["w\u2081", "w\u2082", "b", "loss"] as const;

/** \u0177[] probability row below params. */
export const YHAT_LABEL_Y = 15.9;
export const YHAT_Y = 16.5;

/** Dimmed y[] actual label row below \u0177[]. */
export const YACT_Y = 17.4;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 16 };
