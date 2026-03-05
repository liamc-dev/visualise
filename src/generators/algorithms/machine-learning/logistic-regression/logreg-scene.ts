// src/generators/algorithms/machine-learning/logistic-regression/logreg-scene.ts
// Builds a TraceScene snapshot for a given logistic regression state.

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
  SIGMOID_CHART_X, SIGMOID_CHART_Y,
  SIGMOID_CHART_WIDTH, SIGMOID_CHART_HEIGHT,
  dataYToGrid, dataXToGrid,
} from "./logreg-layout";
import type { ScaledPoint } from "./logreg-layout";

export type DataPoint = { x1: number; x2: number; label: number };

/** Tone per class: class 0 = cyan, class 1 = warning. */
const CLASS_TONES: TraceTone[] = ["cyan", "warning"];
export function classTone(label: number): TraceTone { return CLASS_TONES[label] ?? "neutral"; }

function ptId(i: number) { return `lg:d:${i}`; }
function paramId(k: string) { return `lg:p:${k}`; }

/** Map a TraceTone to an inline CSS color string. */
function toneColor(tone: TraceTone): string {
  return `rgb(var(--tn-${tone}))`;
}

export function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

export type SceneOpts = {
  w1: number;
  w2: number;
  b: number;
  loss: number;
  showBoundary?: boolean;
  highlightIdx?: number;
  dotToneOverrides?: Partial<Record<number, TraceTone>>;
  distUpTo?: number;
  showResult?: boolean;
  paramTones?: Partial<Record<string, TraceTone>>;
  yHat?: (number | null)[];
  lossHistory?: { epoch: number; value: number }[];
};

/** Pre-computed data context shared across all buildScene calls. */
export type SceneCtx = {
  n: number;
  points: DataPoint[];
  scaled: ScaledPoint[];
  normX1: number[];
  normX2: number[];
  x1Min: number; x1Max: number;
  x2Min: number; x2Max: number;
  x1Range: number; x2Range: number;
  arrL: number; arrR: number;
  axisEdges: TraceEdge[];
  axisOverlays: TraceOverlay[];
};

export function buildScene(ctx: SceneCtx, opts: SceneOpts): TraceScene {
  const { n, points, scaled, normX1, normX2,
    x1Min, x1Max, x2Min, x2Max, x1Range, x2Range,
    arrL, arrR } = ctx;
  const nodes: TraceNode[] = [];

  // Parameter cells
  const pv = [fmt(opts.w1, 3), fmt(opts.w2, 3), fmt(opts.b, 3), fmt(opts.loss, 4)];
  for (let i = 0; i < 4; i++) {
    const label = PARAM_LABELS[i];
    const pt = opts.paramTones?.[label];
    nodes.push({ id: paramId(label), kind: "cell",
      pos: { x: PARAM_X[i], y: PARAM_Y },
      meta: { value: pv[i], tone: (pt ?? "neutral") as TraceTone,
        weight: (pt ? 1 : 0) as 0 | 1 } });
  }

  const overlays: TraceOverlay[] = PARAM_LABELS.map((label, i) => (
    { kind: "caption" as const, id: `lg:lbl:${label}`, x: PARAM_X[i],
      y: PARAM_Y_LABEL, text: label, emphasis: "faint" as const }
  ));

  overlays.push(...ctx.axisOverlays);

  // Scatter data points: colored index digit captions (no cell nodes)
  for (let i = 0; i < n; i++) {
    const hl = i === opts.highlightIdx;
    const overrideTone = opts.dotToneOverrides?.[i];

    let tone: TraceTone;
    if (opts.showResult) {
      const pred = opts.yHat?.[i];
      const isCorrect = pred != null && Math.round(pred) === points[i].label;
      tone = isCorrect ? classTone(points[i].label) : "danger";
    } else {
      tone = overrideTone ?? classTone(points[i].label);
    }

    overlays.push({ kind: "caption" as const, id: ptId(i),
      x: scaled[i].x + 0.5, y: scaled[i].y + 0.5, text: String(i),
      emphasis: hl ? "active" as const : "soft" as const,
      align: "center" as const, color: toneColor(tone) });
  }

  // \u0177[] and y[] comparison rows
  if (opts.yHat) {
    const arrStep = n > 1 ? (arrR - arrL) / (n - 1) : 0;
    const arrX = (i: number) => arrL + i * arrStep;
    overlays.push({ kind: "caption" as const, id: "lg:yh-lbl",
      x: arrL - 1.5, y: YHAT_Y, text: "\u0177[]", emphasis: "soft" as const });
    for (let i = 0; i < n; i++) {
      const v = opts.yHat[i];
      const hl = i === opts.highlightIdx;
      overlays.push(
        { kind: "caption" as const, id: `lg:yh:${i}`, x: arrX(i), y: YHAT_Y,
          text: v != null ? fmt(v, 2) : "\u2013",
          emphasis: hl ? "active" as const : "soft" as const,
          align: "center" as const },
        { kind: "caption" as const, id: `lg:yhlbl:${i}`,
          x: arrX(i), y: YHAT_LABEL_Y, text: String(i), emphasis: "faint" as const,
          opacity: 0.4, align: "center" as const },
      );
    }
    overlays.push({ kind: "caption" as const, id: "lg:ya-lbl",
      x: arrL - 1.5, y: YACT_Y, text: "y[]", emphasis: "faint" as const });
    for (let i = 0; i < n; i++) {
      overlays.push({ kind: "caption" as const, id: `lg:ya:${i}`,
        x: arrX(i), y: YACT_Y, text: String(points[i].label), emphasis: "faint" as const,
        align: "center" as const });
    }
  }

  const edges: TraceEdge[] = [...ctx.axisEdges];

  // Decision boundary: w1*x1 + w2*x2 + b = 0
  const hasBoundary = opts.showBoundary !== false && (opts.w1 !== 0 || opts.w2 !== 0);
  if (hasBoundary) {
    const bndPts = computeBoundaryEndpoints(opts.w1, opts.w2, opts.b, ctx);
    if (bndPts) {
      edges.push({ id: "lg:boundary", from: ptId(0), to: ptId(n - 1),
        kind: "regression",
        meta: { fromPt: bndPts.from, toPt: bndPts.to,
          color: "rgb(var(--tn-accent))", opacity: 0.8, arrow: false,
          tone: "accent", weight: 1 } });

      overlays.push({ kind: "caption" as const, id: "lg:eq",
        x: 6, y: 1,
        text: `${fmt(opts.w1, 2)}x\u2081 + ${fmt(opts.w2, 2)}x\u2082 + ${fmt(opts.b, 2)} = 0`,
        emphasis: "soft" as const, align: "center" as const });
    }
  }

  // Perpendicular distance lines from points to boundary
  const distUp = opts.distUpTo ?? -1;
  if (hasBoundary && distUp >= 0) {
    const mag = Math.sqrt(opts.w1 ** 2 + opts.w2 ** 2);
    if (mag > 1e-10) {
      const nw1 = opts.w1 / mag, nw2 = opts.w2 / mag;
      for (let i = 0; i <= distUp && i < n; i++) {
        const d = (opts.w1 * normX1[i] + opts.w2 * normX2[i] + opts.b) / mag;
        const footNx1 = normX1[i] - d * nw1;
        const footNx2 = normX2[i] - d * nw2;
        const footGx = dataXToGrid(footNx1 * x1Range + x1Min, x1Min, x1Max);
        const footGy = dataYToGrid(footNx2 * x2Range + x2Min, x2Min, x2Max);
        const overrideTone = opts.dotToneOverrides?.[i];
        let lineTone: TraceTone;
        if (opts.showResult) {
          const pred = opts.yHat?.[i];
          lineTone = (pred != null && Math.round(pred) === points[i].label)
            ? classTone(points[i].label) : "danger";
        } else {
          lineTone = overrideTone ?? classTone(points[i].label);
        }
        edges.push({ id: `lg:dist:${i}`, from: ptId(i), to: ptId(i),
          kind: "residual",
          meta: { fromPt: { x: scaled[i].x, y: scaled[i].y },
            toPt: { x: footGx, y: footGy },
            tone: lineTone, weight: 0, dashed: true } });
      }
    }
  }

  // Loss curve overlay
  if (opts.lossHistory && opts.lossHistory.length > 0) {
    overlays.push({
      kind: "linechart", id: "lg:loss-chart",
      x: LOSS_CHART_X, y: LOSS_CHART_Y,
      width: LOSS_CHART_WIDTH, height: LOSS_CHART_HEIGHT,
      points: [...opts.lossHistory], yLabel: "BCE",
    });
  }

  // Sigmoid chart overlay
  if (opts.w1 !== 0 || opts.w2 !== 0 || opts.b !== 0) {
    const sigPts = points.map((_, i) => ({
      z: opts.w1 * normX1[i] + opts.w2 * normX2[i] + opts.b,
      label: points[i].label,
      idx: i,
    }));
    overlays.push({
      kind: "sigmoidchart", id: "lg:sigmoid-chart",
      x: SIGMOID_CHART_X, y: SIGMOID_CHART_Y,
      width: SIGMOID_CHART_WIDTH, height: SIGMOID_CHART_HEIGHT,
      w1: opts.w1, w2: opts.w2, b: opts.b,
      dataPoints: sigPts, highlightIdx: opts.highlightIdx,
    });
  }

  const bounds = {
    ...BOUNDS,
    minX: Math.min(BOUNDS.minX, arrL - 1.5),
    maxX: Math.max(BOUNDS.maxX, arrR + 1.5),
  };

  return { nodes, edges, overlays, bounds };
}

/** Compute grid endpoints for the decision boundary line. */
function computeBoundaryEndpoints(
  cw1: number, cw2: number, cb: number, ctx: SceneCtx,
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const pts: { nx1: number; nx2: number }[] = [];

  if (Math.abs(cw2) > 1e-10) {
    const nx2At0 = -(cw1 * 0 + cb) / cw2;
    if (nx2At0 >= -0.1 && nx2At0 <= 1.1) pts.push({ nx1: 0, nx2: nx2At0 });
    const nx2At1 = -(cw1 * 1 + cb) / cw2;
    if (nx2At1 >= -0.1 && nx2At1 <= 1.1) pts.push({ nx1: 1, nx2: nx2At1 });
  }
  if (Math.abs(cw1) > 1e-10) {
    const nx1At0 = -(cw2 * 0 + cb) / cw1;
    if (nx1At0 > 0.01 && nx1At0 < 0.99) pts.push({ nx1: nx1At0, nx2: 0 });
    const nx1At1 = -(cw2 * 1 + cb) / cw1;
    if (nx1At1 > 0.01 && nx1At1 < 0.99) pts.push({ nx1: nx1At1, nx2: 1 });
  }

  if (pts.length < 2) return null;

  const { x1Min, x1Max, x2Min, x2Max, x1Range, x2Range } = ctx;
  const toData1 = (nx: number) => nx * x1Range + x1Min;
  const toData2 = (nx: number) => nx * x2Range + x2Min;

  return {
    from: {
      x: dataXToGrid(toData1(pts[0].nx1), x1Min, x1Max),
      y: dataYToGrid(toData2(pts[0].nx2), x2Min, x2Max),
    },
    to: {
      x: dataXToGrid(toData1(pts[1].nx1), x1Min, x1Max),
      y: dataYToGrid(toData2(pts[1].nx2), x2Min, x2Max),
    },
  };
}

/** Append a calculation caption overlay to an existing scene. */
export function calc(scene: TraceScene, text: string): TraceScene {
  return { ...scene, overlays: [...(scene.overlays ?? []),
    { kind: "caption" as const, id: "lg:calc",
      x: 6, y: 0.5, text, emphasis: "active" as const, align: "center" as const }] };
}
