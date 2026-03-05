// src/generators/algorithms/machine-learning/scatter-layout.ts

/** Shared scatter plot layout constants for ML algorithms. */

/** Scatter plot area: x=[1..11], y=[2..11] (y flipped so low values at bottom). */
export const PLOT_X0 = 1;
export const PLOT_X1 = 11;
export const PLOT_Y0 = 2;
export const PLOT_Y1 = 11;

/** Parameter row below the plot. */
export const PARAM_Y_LABEL = 13.65;
export const PARAM_Y = 14;

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

/** Loss chart: top-right, beside the scatter plot. */
export const LOSS_CHART_X = 14;
export const LOSS_CHART_Y = 2;
export const LOSS_CHART_WIDTH = 5;
export const LOSS_CHART_HEIGHT = 3;

/** Convert an x-data-value to grid x coordinate. */
export function dataXToGrid(
  x: number,
  xMin: number,
  xMax: number,
): number {
  const xRange = xMax - xMin || 1;
  return PLOT_X0 + ((x - xMin) / xRange) * (PLOT_X1 - PLOT_X0);
}
