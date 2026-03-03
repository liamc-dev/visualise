// src/generators/algorithms/machine-learning/linear-regression/linreg-layout.ts

/** Grid coordinates for the scatter plot + parameter display. */

/** Scatter plot area: x=[1..11], y=[2..11] (y flipped so low values at bottom). */
export const PLOT_X0 = 1;
export const PLOT_X1 = 11;
export const PLOT_Y0 = 2;
export const PLOT_Y1 = 11;

/** Parameter row below the plot. */
export const PARAM_Y_LABEL = 12.65;
export const PARAM_Y = 13;
export const PARAM_X = [2, 5, 8, 11] as const;
export const PARAM_LABELS = ["m", "b", "loss", "epoch"] as const;

/** ŷ[] prediction row below params. */
export const YHAT_LABEL_Y = 14.9;
export const YHAT_Y = 15.5;

/** Dimmed y[] comparison row below ŷ[]. */
export const YACT_Y = 16.4;

export const BOUNDS = { minX: -1, minY: 0, maxX: 13, maxY: 15 };

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
    // Flip y so low values are at bottom of grid
    y: PLOT_Y0 + (1 - (p.y - yMin) / yRange) * (PLOT_Y1 - PLOT_Y0),
  }));
}

/** Convert a y-data-value to grid y coordinate. */
export function dataYToGrid(
  y: number,
  yMin: number,
  yMax: number,
): number {
  const yRange = yMax - yMin || 1;
  return PLOT_Y0 + (1 - (y - yMin) / yRange) * (PLOT_Y1 - PLOT_Y0);
}

/** Convert an x-data-value to grid x coordinate. */
export function dataXToGrid(
  x: number,
  xMin: number,
  xMax: number,
): number {
  const xRange = xMax - xMin || 1;
  return PLOT_X0 + ((x - xMin) / xRange) * (PLOT_X1 - PLOT_X0);
}

