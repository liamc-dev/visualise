// src/generators/algorithms/machine-learning/linear-regression/linreg-trace.ts

import type { TraceFrame, TraceScene } from "../../../../types/trace-types";
import { PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1, scalePoints } from "./linreg-layout";
import { buildAxisOverlays } from "../../../../lib/axis-utils";
import { buildScene, calc, fmt } from "./linreg-scene";
import type { DataPoint, SceneCtx } from "./linreg-scene";

const DEFAULT_EPOCHS = 20;
const DEFAULT_LR = 0.1;
const MIN_LR = 0.01;
const MAX_LR = 0.5;
/** Epochs with per-point prediction detail. */
const DETAILED_EPOCHS = 3;

/** Denormalize slope and intercept from normalized space to original. */
function denorm(mn: number, bn: number, xMin: number, xRange: number, yMin: number, yRange: number) {
  const m = mn * yRange / xRange;
  const b = bn * yRange + yMin - m * xMin;
  return { m, b };
}

export function linearRegressionTrace(input: number[]): TraceFrame[] {
  const numEpochs = input.length > 0 ? Math.max(1, Math.round(input[0])) : DEFAULT_EPOCHS;
  const lr = input.length > 1
    ? Math.max(MIN_LR, Math.min(MAX_LR, input[1]))
    : DEFAULT_LR;
  // input[2] is k (used by k-means only)
  const data = input.slice(3);
  const pairs: DataPoint[] = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push({ x: data[i], y: data[i + 1] });
  }
  const n = pairs.length;
  if (n < 2) return [];

  const scaled = scalePoints(pairs);
  const xs = pairs.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const ys = pairs.map((p) => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  // Normalize features to [0,1] for stable gradient descent
  const normX = pairs.map((p) => (p.x - xMin) / xRange);
  const normY = pairs.map((p) => (p.y - yMin) / yRange);

  const arrWidth = Math.max((n - 1) * 1.2, 8);
  const arrCenter = (-1 + 13) / 2;
  const arrL = arrCenter - arrWidth / 2;
  const arrR = arrCenter + arrWidth / 2;

  const axis = buildAxisOverlays({
    plotX0: PLOT_X0, plotX1: PLOT_X1, plotY0: PLOT_Y0, plotY1: PLOT_Y1,
    xMin, xMax, yMin, yMax, prefix: "lr:ax",
  });

  const ctx: SceneCtx = {
    n, pairs, scaled, xMin, xMax, yMin, yMax, arrL, arrR,
    axisEdges: axis.edges, axisOverlays: axis.overlays,
  };

  const scene = (o: Parameters<typeof buildScene>[1]) => buildScene(ctx, o);

  // mn, bn are params in normalized space; denormalize for display
  let mn = 0;
  let bn = 0;
  let prevLoss = 0;
  const frames: TraceFrame[] = [];
  let step = 0;
  const lossHistory: { epoch: number; value: number }[] = [];

  function push(kind: string, token: string, s: TraceScene, meta?: Record<string, unknown>) {
    frames.push({ id: `lr.${kind}.${step++}`, kind, codeToken: token,
      narrationToken: token, scene: s, meta });
  }

  const emptyYHat: null[] = Array(n).fill(null) as null[];
  let lastYHat: (number | null)[] = emptyYHat;

  push("data", "reg.data", scene({ m: 0, b: 0, epoch: 0, loss: 0, showLine: false }), { n });
  push("init", "reg.init", scene({ m: 0, b: 0, epoch: 0, loss: 0, yHat: emptyYHat }), { m: 0, b: 0 });

  // --- epochs ---
  for (let epoch = 1; epoch <= numEpochs; epoch++) {
    const { m, b } = denorm(mn, bn, xMin, xRange, yMin, yRange);

    push("epoch", "reg.epoch", scene({ m, b, epoch, loss: prevLoss, yHat: lastYHat,
      lossHistory }), { epoch });

    // Predictions in original space (for display and loss)
    const yHat = pairs.map((p) => m * p.x + b);
    lastYHat = yHat;
    const isDetailed = epoch <= DETAILED_EPOCHS;

    // --- predict ---
    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const err = pairs[i].y - yHat[i];
        const partYH: (number | null)[] = yHat.map((v, j) => j <= i ? v : null);
        push("predict", "reg.predict.step",
          calc(scene({ m, b, epoch, loss: prevLoss, highlightIdx: i, residualUpTo: i,
            yHat: partYH, lossHistory }),
            `\u0177 = ${fmt(m, 3)}\u00b7${fmt(pairs[i].x, 1)} + ${fmt(b, 3)} = ${fmt(yHat[i], 2)}`),
          { epoch, pointIdx: i, pointX: pairs[i].x, pointY: pairs[i].y,
            yHat: Math.round(yHat[i] * 100) / 100,
            error: Math.round(err * 100) / 100,
            m: Math.round(m * 1000) / 1000, b: Math.round(b * 1000) / 1000 },
        );
      }
    } else {
      push("predict", "reg.predict",
        calc(scene({ m, b, epoch, loss: prevLoss, residualUpTo: n - 1, yHat,
          lossHistory }),
          `\u0177\u1d62 = ${fmt(m, 3)}\u00b7x\u1d62 + ${fmt(b, 3)}`),
        { epoch },
      );
    }

    // --- loss (MSE in original space) ---
    let mse = 0;
    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const sq = (pairs[i].y - yHat[i]) ** 2;
        mse += sq;
        push("loss", "reg.loss.step",
          calc(scene({ m, b, epoch, loss: prevLoss, highlightIdx: i, yHat,
            lossHistory }),
            `(${fmt(pairs[i].y, 1)} \u2212 ${fmt(yHat[i], 2)})\u00b2 = ${fmt(sq, 3)}   sum = ${fmt(mse, 3)}`),
          { epoch, pointIdx: i, sq: Math.round(sq * 1000) / 1000,
            sum: Math.round(mse * 1000) / 1000, n });
      }
    } else {
      for (let i = 0; i < n; i++) mse += (pairs[i].y - yHat[i]) ** 2;
      push("loss", "reg.loss.step", scene({ m, b, epoch, loss: prevLoss, yHat,
        lossHistory }), { epoch, n });
    }
    mse /= n;
    lossHistory.push({ epoch, value: mse });
    push("loss", "reg.loss.avg",
      calc(scene({ m, b, epoch, loss: mse, yHat,
        paramTones: { loss: "warning" }, lossHistory }),
        `MSE = ${fmt(mse, 4)}  (sum / ${n})`),
      { epoch, loss: Math.round(mse * 100) / 100, n },
    );
    prevLoss = mse;

    // --- gradient (in normalized space for stability) ---
    const yHatNorm = normX.map((nx) => mn * nx + bn);
    let dm = 0;
    let db = 0;
    for (let i = 0; i < n; i++) {
      dm += normX[i] * (normY[i] - yHatNorm[i]);
      db += (normY[i] - yHatNorm[i]);
    }
    push("grad", "reg.grad.step",
      calc(scene({ m, b, epoch, loss: mse, residualUpTo: n - 1, yHat, lossHistory }),
        `\u03a3 x\u1d62(y\u1d62\u2212\u0177\u1d62) = ${fmt(dm, 3)}   \u03a3 (y\u1d62\u2212\u0177\u1d62) = ${fmt(db, 3)}`),
      { epoch },
    );
    dm = (-2 / n) * dm;
    db = (-2 / n) * db;
    push("grad", "reg.grad.scale",
      calc(scene({ m, b, epoch, loss: mse, residualUpTo: n - 1, yHat,
        paramTones: { m: "cyan", b: "cyan" }, lossHistory }),
        `\u2202L/\u2202m = ${fmt(dm, 3)}   \u2202L/\u2202b = ${fmt(db, 3)}`),
      { epoch, dm: Math.round(dm * 1000) / 1000, db: Math.round(db * 1000) / 1000 },
    );

    // --- update (in normalized space) ---
    const oldDenorm = denorm(mn, bn, xMin, xRange, yMin, yRange);
    mn -= lr * dm;
    bn -= lr * db;
    const newDenorm = denorm(mn, bn, xMin, xRange, yMin, yRange);
    push("update", "reg.update",
      calc(scene({ m: newDenorm.m, b: newDenorm.b, epoch, loss: mse, yHat,
        paramTones: { m: "accent", b: "accent" }, lossHistory }),
        `m: ${fmt(oldDenorm.m, 3)} \u2192 ${fmt(newDenorm.m, 3)}   b: ${fmt(oldDenorm.b, 3)} \u2192 ${fmt(newDenorm.b, 3)}`),
      { epoch,
        oldM: Math.round(oldDenorm.m * 1000) / 1000, oldB: Math.round(oldDenorm.b * 1000) / 1000,
        m: Math.round(newDenorm.m * 1000) / 1000, b: Math.round(newDenorm.b * 1000) / 1000 },
    );
  }

  // --- reg.done ---
  const { m: finalM, b: finalB } = denorm(mn, bn, xMin, xRange, yMin, yRange);
  const finalLoss = pairs.reduce((s, p) => s + (p.y - (finalM * p.x + finalB)) ** 2, 0) / n;
  const finalYHat = pairs.map((p) => finalM * p.x + finalB);
  push("done", "reg.done",
    calc(scene({ m: finalM, b: finalB, epoch: numEpochs, loss: finalLoss, yHat: finalYHat, lossHistory }),
      `\u0177 = ${fmt(finalM, 3)}x + ${fmt(finalB, 3)}   MSE = ${fmt(finalLoss, 4)}`),
    {
      m: Math.round(finalM * 1000) / 1000,
      b: Math.round(finalB * 1000) / 1000,
      loss: Math.round(finalLoss * 100) / 100,
    },
  );

  return frames;
}
