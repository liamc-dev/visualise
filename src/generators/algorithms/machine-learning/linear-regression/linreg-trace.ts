// src/generators/algorithms/machine-learning/linear-regression/linreg-trace.ts

import type {
  TraceFrame,
  TraceNode,
  TraceEdge,
  TraceOverlay,
  TraceScene,
  TraceTone,
} from "../../../../types/trace-types";
import {
  BOUNDS,
  PARAM_X,
  PARAM_Y,
  PARAM_Y_LABEL,
  PARAM_LABELS,
  YHAT_Y,
  YHAT_LABEL_Y,
  scalePoints,
  dataYToGrid,
  dataXToGrid,
} from "./linreg-layout";

const NUM_EPOCHS = 20;
const LEARNING_RATE = 0.01;
/** Epochs with per-point prediction detail. */
const DETAILED_EPOCHS = 3;

function ptId(i: number) { return `lr:d:${i}`; }
function paramId(k: string) { return `lr:p:${k}`; }

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "\u2013";
}

type DataPoint = { x: number; y: number };

type SceneOpts = {
  m: number;
  b: number;
  epoch: number;
  loss: number;
  showLine?: boolean;
  highlightIdx?: number;
  /** Show residuals for points [0..residualUpTo]. -1 = none. */
  residualUpTo?: number;
  /** Tone overrides for parameter cells by label. */
  paramTones?: Partial<Record<string, TraceTone>>;
  /** Prediction values for ŷ[] row. null = not yet computed. */
  yHat?: (number | null)[];
};

export function linearRegressionTrace(input: number[]): TraceFrame[] {
  const pairs: DataPoint[] = [];
  for (let i = 0; i < input.length; i += 2) {
    pairs.push({ x: input[i], y: input[i + 1] });
  }
  const n = pairs.length;
  if (n < 2) return [];

  const scaled = scalePoints(pairs);
  const xs = pairs.map((p) => p.x);
  const ys = pairs.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const bounds = { ...BOUNDS, maxX: Math.max(BOUNDS.maxX, n + 2) };

  let m = 0;
  let b = 0;
  let prevLoss = 0;
  const frames: TraceFrame[] = [];
  let step = 0;

  function buildScene(opts: SceneOpts): TraceScene {
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

    // Scatter data points as value labels
    for (let i = 0; i < n; i++) {
      const hl = i === opts.highlightIdx;
      overlays.push({ kind: "caption" as const, id: ptId(i),
        x: scaled[i].x, y: scaled[i].y, text: fmt(scaled[i].oy, 1),
        emphasis: hl ? "active" as const : "soft" as const,
        align: "center" as const });
    }

    // ŷ[] prediction row
    if (opts.yHat) {
      overlays.push({ kind: "caption" as const, id: "lr:yh-lbl",
        x: -0.5, y: YHAT_Y, text: "\u0177[]", emphasis: "soft" as const });
      for (let i = 0; i < n; i++) {
        const v = opts.yHat[i];
        const hl = i === opts.highlightIdx;
        nodes.push({ id: `lr:yh:${i}`, kind: "cell", pos: { x: 1 + i, y: YHAT_Y },
          meta: { value: v != null ? fmt(v, 2) : "\u2013",
            tone: (hl ? "warning" : v != null ? "info" : "neutral") as TraceTone,
            weight: (hl ? 1 : 0) as 0 | 1 } });
        overlays.push({ kind: "caption" as const, id: `lr:yhlbl:${i}`,
          x: 1 + i, y: YHAT_LABEL_Y, text: String(i), emphasis: "faint" as const });
      }
    }

    const edges: TraceEdge[] = [];

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

      // Line equation caption at midpoint
      const midX = (gx0 + gx1) / 2;
      const midY = (gy0 + gy1) / 2 - 0.45;
      overlays.push({ kind: "caption" as const, id: "lr:eq",
        x: midX, y: midY,
        text: `\u0177 = ${fmt(opts.m, 3)}x + ${fmt(opts.b, 3)}`,
        emphasis: "soft" as const, align: "center" as const });
    }

    // Residual lines
    const resUp = opts.residualUpTo ?? -1;
    for (let i = 0; i <= resUp && i < n; i++) {
      const gridPredY = dataYToGrid(opts.m * pairs[i].x + opts.b, yMin, yMax);
      edges.push({
        id: `lr:res:${i}`,
        from: ptId(i),
        to: ptId(i),
        kind: "residual",
        meta: {
          fromPt: { x: scaled[i].x, y: scaled[i].y },
          toPt: { x: scaled[i].x, y: gridPredY },
          tone: "danger",
          weight: 0,
          dashed: true,
        },
      });
    }

    return { nodes, edges, overlays, bounds };
  }

  function push(kind: string, token: string, scene: TraceScene, meta?: Record<string, unknown>) {
    frames.push({ id: `lr.${kind}.${step++}`, kind, codeToken: token,
      narrationToken: token, scene, meta });
  }

  function calc(scene: TraceScene, text: string): TraceScene {
    return { ...scene, overlays: [...scene.overlays, { kind: "caption" as const, id: "lr:calc",
      x: 6, y: 0.5, text, emphasis: "active" as const, align: "center" as const }] };
  }

  const emptyYHat: null[] = Array(n).fill(null) as null[];

  push("data", "reg.data", buildScene({ m: 0, b: 0, epoch: 0, loss: 0, showLine: false }), { n });
  push("init", "reg.init", buildScene({ m: 0, b: 0, epoch: 0, loss: 0, yHat: emptyYHat }), { m: 0, b: 0 });

  // --- epochs ---
  for (let epoch = 1; epoch <= NUM_EPOCHS; epoch++) {
    push("epoch", "reg.epoch", buildScene({ m, b, epoch, loss: prevLoss, yHat: emptyYHat }), { epoch });

    const yHat = pairs.map((p) => m * p.x + b);
    const isDetailed = epoch <= DETAILED_EPOCHS;

    // --- predict ---
    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const err = pairs[i].y - yHat[i];
        const partYH: (number | null)[] = yHat.map((v, j) => j <= i ? v : null);
        push("predict", "reg.predict.step",
          calc(buildScene({ m, b, epoch, loss: prevLoss, highlightIdx: i, residualUpTo: i,
            yHat: partYH }),
            `\u0177 = ${fmt(m, 3)}\u00b7${fmt(pairs[i].x, 1)} + ${fmt(b, 3)} = ${fmt(yHat[i], 2)}`),
          { epoch, pointIdx: i, pointX: pairs[i].x, pointY: pairs[i].y,
            yHat: Math.round(yHat[i] * 100) / 100,
            error: Math.round(err * 100) / 100,
            m: Math.round(m * 1000) / 1000, b: Math.round(b * 1000) / 1000 },
        );
      }
    } else {
      push("predict", "reg.predict",
        calc(buildScene({ m, b, epoch, loss: prevLoss, residualUpTo: n - 1, yHat }),
          `\u0177\u1d62 = ${fmt(m, 3)}\u00b7x\u1d62 + ${fmt(b, 3)}`),
        { epoch },
      );
    }

    // --- loss (before gradients — standard order) ---
    let mse = 0;
    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const sq = (pairs[i].y - yHat[i]) ** 2;
        mse += sq;
        push("loss", "reg.loss.step",
          calc(buildScene({ m, b, epoch, loss: prevLoss, highlightIdx: i, yHat }),
            `(${fmt(pairs[i].y, 1)} \u2212 ${fmt(yHat[i], 2)})\u00b2 = ${fmt(sq, 3)}   sum = ${fmt(mse, 3)}`),
          { epoch, pointIdx: i, sq: Math.round(sq * 1000) / 1000,
            sum: Math.round(mse * 1000) / 1000, n });
      }
    } else {
      for (let i = 0; i < n; i++) mse += (pairs[i].y - yHat[i]) ** 2;
      push("loss", "reg.loss.step", buildScene({ m, b, epoch, loss: prevLoss, yHat }), { epoch, n });
    }
    mse /= n;
    push("loss", "reg.loss.avg",
      calc(buildScene({ m, b, epoch, loss: mse, yHat,
        paramTones: { loss: "warning" } }),
        `MSE = ${fmt(mse, 4)}  (sum / ${n})`),
      { epoch, loss: Math.round(mse * 100) / 100, n },
    );
    prevLoss = mse;

    // --- gradient ---
    let dm = 0;
    let db = 0;
    for (let i = 0; i < n; i++) {
      dm += pairs[i].x * (pairs[i].y - yHat[i]);
      db += (pairs[i].y - yHat[i]);
    }
    push("grad", "reg.grad.step",
      calc(buildScene({ m, b, epoch, loss: mse, residualUpTo: n - 1, yHat }),
        `\u03a3 x\u1d62(y\u1d62\u2212\u0177\u1d62) = ${fmt(dm, 3)}   \u03a3 (y\u1d62\u2212\u0177\u1d62) = ${fmt(db, 3)}`),
      { epoch },
    );
    dm = (-2 / n) * dm;
    db = (-2 / n) * db;
    push("grad", "reg.grad.scale",
      calc(buildScene({ m, b, epoch, loss: mse, residualUpTo: n - 1, yHat,
        paramTones: { m: "cyan", b: "cyan" } }),
        `\u2202L/\u2202m = ${fmt(dm, 3)}   \u2202L/\u2202b = ${fmt(db, 3)}`),
      { epoch, dm: Math.round(dm * 1000) / 1000, db: Math.round(db * 1000) / 1000 },
    );

    // --- update ---
    const oldM = m;
    const oldB = b;
    m -= LEARNING_RATE * dm;
    b -= LEARNING_RATE * db;
    push("update", "reg.update",
      calc(buildScene({ m, b, epoch, loss: mse, yHat,
        paramTones: { m: "accent", b: "accent" } }),
        `m: ${fmt(oldM, 3)} \u2192 ${fmt(m, 3)}   b: ${fmt(oldB, 3)} \u2192 ${fmt(b, 3)}`),
      { epoch, oldM: Math.round(oldM * 1000) / 1000, oldB: Math.round(oldB * 1000) / 1000,
        m: Math.round(m * 1000) / 1000, b: Math.round(b * 1000) / 1000 },
    );
  }

  // --- reg.done ---
  const finalLoss = pairs.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0) / n;
  const finalYHat = pairs.map((p) => m * p.x + b);
  push("done", "reg.done",
    calc(buildScene({ m, b, epoch: NUM_EPOCHS, loss: finalLoss, yHat: finalYHat }),
      `\u0177 = ${fmt(m, 3)}x + ${fmt(b, 3)}   MSE = ${fmt(finalLoss, 4)}`),
    {
      m: Math.round(m * 1000) / 1000,
      b: Math.round(b * 1000) / 1000,
      loss: Math.round(finalLoss * 100) / 100,
    },
  );

  return frames;
}
