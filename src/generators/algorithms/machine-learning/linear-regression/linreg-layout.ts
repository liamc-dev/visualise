// src/generators/algorithms/machine-learning/linear-regression/linreg-layout.ts

/** Grid coordinates for the scatter plot + parameter display. */

import {
  LOSS_CHART_X as _LCX,
  LOSS_CHART_Y as _LCY,
  LOSS_CHART_WIDTH as _LCW,
  LOSS_CHART_HEIGHT as _LCH,
} from "../scatter-layout";

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
export const PARAM_LABELS = ["m", "b", "loss", "epoch"] as const;

/** ŷ[] prediction row below params. */
export const YHAT_LABEL_Y = 15.9;
export const YHAT_Y = 16.5;

/** Dimmed y[] comparison row below ŷ[]. */
export const YACT_Y = 17.4;

/** Residual chart: below the loss chart. */
export const RESIDUAL_CHART_X = _LCX;
export const RESIDUAL_CHART_Y = _LCY + _LCH + 1;
export const RESIDUAL_CHART_WIDTH = _LCW;
export const RESIDUAL_CHART_HEIGHT = 4;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 16 };
