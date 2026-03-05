// src/generators/algorithms/machine-learning/linear-regression/linreg-scene.ts
// Builds a TraceScene snapshot for a given linear regression state.

import type {
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import {
  BOUNDS, PARAM_X, PARAM_Y, PARAM_Y_LABEL, PARAM_LABELS,
  YHAT_Y, YHAT_LABEL_Y, YACT_Y,
  LOSS_CHART_X, LOSS_CHART_Y,
  LOSS_CHART_WIDTH, LOSS_CHART_HEIGHT,
  dataYToGrid, dataXToGrid,
} from "./linreg-layout";
import type { ScaledPoint } from "./linreg-layout";

export type DataPoint = { x: number; y: number };

function ptId(i: number) { return `lr:d:${i}`; }
function paramId(k: string) { return `lr:p:${k}`; }

export function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

/** Map residual magnitude to a tone: small = accent, medium = warning, large = danger. */
function errorTone(absErr: number, yRange: number): TraceTone {
  const rel = yRange > 0 ? absErr / yRange : 0;
  if (rel < 0.15) return "accent";
  if (rel < 0.35) return "warning";
  return "danger";
}

function toneColor(tone: TraceTone): string {
  return `rgb(var(--tn-${tone}))`;
}

export type SceneOpts = {
  m: number;
  b: number;
  epoch: number;
  loss: number;
  showLine?: boolean;
  highlightIdx?: number;
  residualUpTo?: number;
  paramTones?: Partial<Record<string, TraceTone>>;
  yHat?: (number | null)[];
  lossHistory?: { epoch: number; value: number }[];
};

export type SceneCtx = {
  n: number;
  pairs: DataPoint[];
  scaled: ScaledPoint[];
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  arrL: number; arrR: number;
  axisEdges: TraceEdge[];
  axisOverlays: TraceOverlay[];
};

export function buildScene(ctx: SceneCtx, opts: SceneOpts): TraceScene {
  const { n, pairs, scaled, xMin, xMax, yMin, yMax, arrL, arrR } = ctx;
  const nodes: TraceNode[] = [];

  // Parameter cells
  const pv = [fmt(opts.m, 3), fmt(opts.b, 3), fmt(opts.loss, 2), String(opts.epoch)];
  for (let i = 0; i < 4; i++) {
    const label = PARAM_LABELS[i];
    const pt = opts.paramTones?.[label];
    nodes.push({ id: paramId(label), kind: "cell",
      pos: { x: PARAM_X[i], y: PARAM_Y },
      meta: { value: pv[i], tone: (pt ?? "neutral") as TraceTone,
        weight: (pt ? 1 : 0) as 0 | 1 } });
  }

  const overlays: TraceOverlay[] = PARAM_LABELS.map((label, i) => (
    { kind: "caption" as const, id: `lr:lbl:${label}`, x: PARAM_X[i],
      y: PARAM_Y_LABEL, text: label, emphasis: "faint" as const }
  ));

  // Axis tick labels
  overlays.push(...ctx.axisOverlays);

  // Scatter data points as index labels, colored by residual magnitude
  const yRange = yMax - yMin;
  for (let i = 0; i < n; i++) {
    const hl = i === opts.highlightIdx;
    const hasLine = opts.showLine !== false && (opts.m !== 0 || opts.b !== 0);
    const color = hasLine
      ? toneColor(errorTone(Math.abs(pairs[i].y - (opts.m * pairs[i].x + opts.b)), yRange))
      : undefined;
    overlays.push({ kind: "caption" as const, id: ptId(i),
      x: scaled[i].x + 0.5, y: scaled[i].y + 0.5, text: String(i),
      emphasis: hl ? "active" as const : "soft" as const,
      align: "center" as const, color });
  }

  // ŷ[] and y[] comparison rows (captions only, no cells)
  if (opts.yHat) {
    const step = n > 1 ? (arrR - arrL) / (n - 1) : 0;
    const arrX = (i: number) => arrL + i * step;
    overlays.push({ kind: "caption" as const, id: "lr:yh-lbl",
      x: arrL - 1.5, y: YHAT_Y, text: "\u0177[]", emphasis: "soft" as const });
    for (let i = 0; i < n; i++) {
      const v = opts.yHat[i];
      const hl = i === opts.highlightIdx;
      overlays.push(
        { kind: "caption" as const, id: `lr:yh:${i}`, x: arrX(i), y: YHAT_Y,
          text: v != null ? fmt(v, 2) : "\u2013",
          emphasis: hl ? "active" as const : "soft" as const,
          align: "center" as const },
        { kind: "caption" as const, id: `lr:yhlbl:${i}`,
          x: arrX(i), y: YHAT_LABEL_Y, text: String(i), emphasis: "faint" as const,
          opacity: 0.4, align: "center" as const },
      );
    }
    // Dimmed actual y[] below ŷ[] for comparison
    overlays.push({ kind: "caption" as const, id: "lr:ya-lbl",
      x: arrL - 1.5, y: YACT_Y, text: "y[]", emphasis: "faint" as const });
    for (let i = 0; i < n; i++) {
      overlays.push({ kind: "caption" as const, id: `lr:ya:${i}`,
        x: arrX(i), y: YACT_Y, text: fmt(pairs[i].y, 1), emphasis: "faint" as const,
        align: "center" as const });
    }
  }

  const edges: TraceEdge[] = [...ctx.axisEdges];

  // Regression line
  if (opts.showLine !== false) {
    const gx0 = dataXToGrid(xMin, xMin, xMax);
    const gx1 = dataXToGrid(xMax, xMin, xMax);
    const gy0 = dataYToGrid(opts.m * xMin + opts.b, yMin, yMax);
    const gy1 = dataYToGrid(opts.m * xMax + opts.b, yMin, yMax);
    edges.push({ id: "lr:line", from: ptId(0), to: ptId(n - 1), kind: "regression",
      meta: { fromPt: { x: gx0, y: gy0 }, toPt: { x: gx1, y: gy1 },
        color: "rgb(var(--tn-accent))", opacity: 0.8, arrow: false,
        tone: "accent", weight: 1 } });

    // Line equation caption above the calc overlay
    overlays.push({ kind: "caption" as const, id: "lr:eq",
      x: 6, y: 1,
      text: `\u0177 = ${fmt(opts.m, 3)}x + ${fmt(opts.b, 3)}`,
      emphasis: "soft" as const, align: "center" as const });
  }

  // Residual lines, colored by error magnitude
  const resUp = opts.residualUpTo ?? -1;
  for (let i = 0; i <= resUp && i < n; i++) {
    const gy = dataYToGrid(opts.m * pairs[i].x + opts.b, yMin, yMax);
    const rTone = errorTone(Math.abs(pairs[i].y - (opts.m * pairs[i].x + opts.b)), yRange);
    edges.push({ id: `lr:res:${i}`, from: ptId(i), to: ptId(i), kind: "residual",
      meta: { fromPt: { x: scaled[i].x, y: scaled[i].y },
        toPt: { x: scaled[i].x, y: gy }, tone: rTone, weight: 0, dashed: true } });
  }

  // Loss curve overlay
  if (opts.lossHistory && opts.lossHistory.length > 0) {
    overlays.push({
      kind: "linechart", id: "lr:loss-chart",
      x: LOSS_CHART_X, y: LOSS_CHART_Y,
      width: LOSS_CHART_WIDTH, height: LOSS_CHART_HEIGHT,
      points: [...opts.lossHistory], yLabel: "MSE",
    });
  }

  const bounds = {
    ...BOUNDS,
    minX: Math.min(BOUNDS.minX, arrL - 1.5),
    maxX: Math.max(BOUNDS.maxX, arrR + 1.5),
  };

  return { nodes, edges, overlays, bounds };
}

/** Append a calculation caption overlay to an existing scene. */
export function calc(scene: TraceScene, text: string): TraceScene {
  return { ...scene, overlays: [...(scene.overlays ?? []), { kind: "caption" as const, id: "lr:calc",
    x: 6, y: 0.5, text, emphasis: "active" as const, align: "center" as const }] };
}
