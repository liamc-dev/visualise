// src/lib/axis-utils.ts
// Reusable axis overlay builder for any chart/scatter plot in the trace system.

import type { TraceEdge, TraceOverlay } from "../types/trace-types";

export type AxisOpts = {
  plotX0: number; plotX1: number;
  plotY0: number; plotY1: number;
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  prefix?: string;
  opacity?: number;
  maxTicks?: number;
};

/** Pick a "nice" step size for axis ticks (1, 2, 5, 10, 20, …). */
function niceStep(range: number, maxTicks: number): number {
  const rough = range / Math.max(maxTicks, 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}

type AxisTick = { gridPos: number; label: string };

function axisTicks(
  min: number, max: number, maxTicks: number,
  toGrid: (v: number) => number,
): AxisTick[] {
  const range = max - min;
  if (range <= 0) return [{ gridPos: toGrid(min), label: String(min) }];
  const step = niceStep(range, maxTicks);
  const ticks: AxisTick[] = [];
  const start = Math.ceil(min / step) * step;
  const decimals = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push({ gridPos: toGrid(v), label: v.toFixed(decimals) });
  }
  return ticks;
}

function dataToGrid(
  v: number, min: number, max: number, g0: number, g1: number, flip = false,
): number {
  const range = max - min || 1;
  const t = (v - min) / range;
  return g0 + (flip ? 1 - t : t) * (g1 - g0);
}

/** Build axis lines, spokes, and tick labels for a plot region. */
export function buildAxisOverlays(opts: AxisOpts): {
  edges: TraceEdge[];
  overlays: TraceOverlay[];
} {
  const { plotX0, plotX1, plotY0, plotY1, xMin, xMax, yMin, yMax } = opts;
  const pre = opts.prefix ?? "ax";
  const op = opts.opacity ?? 0.3;
  const mt = opts.maxTicks ?? 5;

  const xTicks = axisTicks(xMin, xMax, mt, (v) => dataToGrid(v, xMin, xMax, plotX0, plotX1));
  const yTicks = axisTicks(yMin, yMax, mt, (v) => dataToGrid(v, yMin, yMax, plotY0, plotY1, true));

  const axS = { color: "rgb(var(--tn-subtle))", opacity: op, arrow: false };
  const ax = (id: string, fx: number, fy: number, tx: number, ty: number): TraceEdge =>
    ({ id, from: id, to: id, kind: "axis", meta: { fromPt: { x: fx, y: fy }, toPt: { x: tx, y: ty }, ...axS } });

  const bx = plotX0 - 0.5, by = plotY1 + 0.5, ty = plotY0 - 0.5;
  const edges: TraceEdge[] = [
    ax(`${pre}:x`, bx, by, plotX1 + 0.5, by),
    ax(`${pre}:y`, bx, ty, bx, by),
  ];
  for (const t of xTicks) edges.push(ax(`${pre}:sx:${t.label}`, t.gridPos, by, t.gridPos, by + 0.2));
  for (const t of yTicks) edges.push(ax(`${pre}:sy:${t.label}`, bx, t.gridPos, bx - 0.2, t.gridPos));

  // +0.5 offset: captions position from cell top-left, edges from cell center
  const labelYX = plotX0 - 0.85 + 0.5;
  const labelXY = plotY1 + 0.85 + 0.5;
  const overlays: TraceOverlay[] = [];
  for (const t of xTicks) overlays.push({ kind: "caption", id: `${pre}:lx:${t.label}`,
    x: t.gridPos + 0.5, y: labelXY, text: t.label, emphasis: "faint", align: "center", opacity: op });
  for (const t of yTicks) overlays.push({ kind: "caption", id: `${pre}:ly:${t.label}`,
    x: labelYX, y: t.gridPos + 0.5, text: t.label, emphasis: "faint", align: "center", opacity: op });

  return { edges, overlays };
}
