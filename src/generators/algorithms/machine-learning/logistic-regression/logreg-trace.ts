// src/generators/algorithms/machine-learning/logistic-regression/logreg-trace.ts

import type { TraceFrame, TraceScene } from "../../../../types/trace-types";
import { PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1, scalePoints } from "./logreg-layout";
import { PARAM_LABELS } from "./logreg-layout";
import { buildAxisOverlays } from "../../../../lib/axis-utils";
import { buildScene, calc, fmt } from "./logreg-scene";
import type { DataPoint, SceneCtx } from "./logreg-scene";

const DEFAULT_EPOCHS = 20;
const DEFAULT_LR = 5.0;
const MIN_LR = 0.1;
const MAX_LR = 10;
/** Epochs with per-point prediction detail. */
const DETAILED_EPOCHS = 3;

function sigmoid(z: number): number {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

/** Clamp to avoid log(0). */
function safeLog(v: number): number {
  return Math.log(Math.max(v, 1e-15));
}

export function logisticRegressionTrace(input: number[]): TraceFrame[] {
  const numEpochs = input.length > 0 ? Math.max(1, Math.round(input[0])) : DEFAULT_EPOCHS;
  const lr = input.length > 1
    ? Math.max(MIN_LR, Math.min(MAX_LR, input[1]))
    : DEFAULT_LR;
  // input[2] is k (used by k-means only)
  const data = input.slice(3);
  const rawPairs: { x: number; y: number }[] = [];
  for (let i = 0; i < data.length; i += 2) {
    rawPairs.push({ x: data[i], y: data[i + 1] });
  }
  const n = rawPairs.length;
  if (n < 2) return [];

  // Auto-label: sort by x+y, first half = class 0, second half = class 1
  const indexed = rawPairs.map((p, i) => ({ ...p, origIdx: i, sum: p.x + p.y }));
  indexed.sort((a, b) => a.sum - b.sum);
  const mid = Math.floor(n / 2);
  const labels = new Array<number>(n);
  for (let i = 0; i < indexed.length; i++) {
    labels[indexed[i].origIdx] = i < mid ? 0 : 1;
  }

  const points: DataPoint[] = rawPairs.map((p, i) => ({
    x1: p.x, x2: p.y, label: labels[i],
  }));

  // Normalize features to [0, 1] for stable gradient descent
  const x1s = points.map((p) => p.x1);
  const x2s = points.map((p) => p.x2);
  const x1Min = Math.min(...x1s), x1Max = Math.max(...x1s);
  const x2Min = Math.min(...x2s), x2Max = Math.max(...x2s);
  const x1Range = x1Max - x1Min || 1;
  const x2Range = x2Max - x2Min || 1;
  const normX1 = points.map((p) => (p.x1 - x1Min) / x1Range);
  const normX2 = points.map((p) => (p.x2 - x2Min) / x2Range);

  const scaled = scalePoints(rawPairs);

  // Array display layout
  const arrWidth = Math.max((n - 1) * 1.2, 8);
  const arrCenter = (-1 + 13) / 2; // (BOUNDS.minX + BOUNDS.maxX) / 2
  const arrL = arrCenter - arrWidth / 2;
  const arrR = arrCenter + arrWidth / 2;

  const axis = buildAxisOverlays({
    plotX0: PLOT_X0, plotX1: PLOT_X1, plotY0: PLOT_Y0, plotY1: PLOT_Y1,
    xMin: x1Min, xMax: x1Max, yMin: x2Min, yMax: x2Max, prefix: "lg:ax",
  });

  const ctx: SceneCtx = {
    n, points, scaled, normX1, normX2,
    x1Min, x1Max, x2Min, x2Max, x1Range, x2Range,
    arrL, arrR, axisEdges: axis.edges, axisOverlays: axis.overlays,
  };

  const scene = (o: Parameters<typeof buildScene>[1]) => buildScene(ctx, o);

  let w1 = 0, w2 = 0, b = 0;
  let prevLoss = 0;
  const frames: TraceFrame[] = [];
  let step = 0;
  const lossHistory: { epoch: number; value: number }[] = [];

  function push(
    kind: string, token: string, s: TraceScene, meta?: Record<string, unknown>,
  ) {
    frames.push({ id: `lg.${kind}.${step++}`, kind, codeToken: token,
      narrationToken: token, scene: s, meta });
  }

  const emptyYHat: null[] = Array(n).fill(null) as null[];

  // --- data ---
  push("data", "log.data",
    scene({ w1: 0, w2: 0, b: 0, loss: 0, showBoundary: false, lossHistory }),
    { n });

  // --- init ---
  push("init", "log.init",
    scene({ w1: 0, w2: 0, b: 0, loss: 0, showBoundary: false, yHat: emptyYHat, lossHistory }),
    { w1: 0, w2: 0, b: 0 });

  // --- epochs ---
  for (let epoch = 1; epoch <= numEpochs; epoch++) {
    push("epoch", "log.epoch",
      scene({ w1, w2, b, loss: prevLoss, yHat: emptyYHat, lossHistory }),
      { epoch });

    const isDetailed = epoch <= DETAILED_EPOCHS;

    // --- predict ---
    const yHat = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const z = w1 * normX1[i] + w2 * normX2[i] + b;
      yHat[i] = sigmoid(z);
    }

    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const partYH: (number | null)[] = yHat.map((v, j) => j <= i ? v : null);
        const isCorrect = Math.round(yHat[i]) === points[i].label;
        push("predict", "log.predict.step",
          calc(scene({ w1, w2, b, loss: prevLoss, highlightIdx: i,
            dotToneOverrides: { [i]: isCorrect ? "accent" : "danger" },
            distUpTo: i, yHat: partYH, lossHistory }),
            `z = ${fmt(w1, 2)}\u00b7${fmt(normX1[i], 2)} + ${fmt(w2, 2)}\u00b7${fmt(normX2[i], 2)} + ${fmt(b, 2)}   \u0177 = \u03c3(z) = ${fmt(yHat[i], 3)}`),
          { epoch, pointIdx: i, prob: Math.round(yHat[i] * 1000) / 1000,
            label: points[i].label, correct: isCorrect });
      }
    } else {
      push("predict", "log.predict",
        calc(scene({ w1, w2, b, loss: prevLoss, distUpTo: n - 1, yHat, lossHistory }),
          `\u0177\u1d62 = \u03c3(w\u2081x\u2081 + w\u2082x\u2082 + b)`),
        { epoch });
    }

    // --- loss (BCE) ---
    let lossSum = 0;
    if (isDetailed) {
      for (let i = 0; i < n; i++) {
        const li = -(points[i].label * safeLog(yHat[i]) +
          (1 - points[i].label) * safeLog(1 - yHat[i]));
        lossSum += li;
        push("loss", "log.loss.step",
          calc(scene({ w1, w2, b, loss: prevLoss, highlightIdx: i,
            distUpTo: n - 1, yHat, lossHistory }),
            `-[${points[i].label}\u00b7log(${fmt(yHat[i], 3)}) + ${1 - points[i].label}\u00b7log(${fmt(1 - yHat[i], 3)})] = ${fmt(li, 3)}`),
          { epoch, pointIdx: i, li: Math.round(li * 1000) / 1000,
            sum: Math.round(lossSum * 1000) / 1000, n,
            prob: Math.round(yHat[i] * 1000) / 1000, label: points[i].label });
      }
    } else {
      for (let i = 0; i < n; i++) {
        lossSum += -(points[i].label * safeLog(yHat[i]) +
          (1 - points[i].label) * safeLog(1 - yHat[i]));
      }
      push("loss", "log.loss.step",
        scene({ w1, w2, b, loss: prevLoss, distUpTo: n - 1, yHat, lossHistory }),
        { epoch, n });
    }
    const avgLoss = lossSum / n;
    lossHistory.push({ epoch, value: avgLoss });
    push("loss", "log.loss.avg",
      calc(scene({ w1, w2, b, loss: avgLoss, distUpTo: n - 1, yHat,
        paramTones: { loss: "warning" }, lossHistory }),
        `BCE = ${fmt(avgLoss, 4)}  (sum / ${n})`),
      { epoch, loss: Math.round(avgLoss * 10000) / 10000, n });
    prevLoss = avgLoss;

    // --- gradients ---
    let dw1 = 0, dw2 = 0, db = 0;
    for (let i = 0; i < n; i++) {
      const err = yHat[i] - points[i].label;
      dw1 += err * normX1[i];
      dw2 += err * normX2[i];
      db += err;
    }
    push("grad", "log.grad.step",
      calc(scene({ w1, w2, b, loss: avgLoss, distUpTo: n - 1, yHat, lossHistory }),
        `\u03a3 err\u00b7x\u2081 = ${fmt(dw1, 3)}   \u03a3 err\u00b7x\u2082 = ${fmt(dw2, 3)}   \u03a3 err = ${fmt(db, 3)}`),
      { epoch });
    dw1 /= n; dw2 /= n; db /= n;
    push("grad", "log.grad.scale",
      calc(scene({ w1, w2, b, loss: avgLoss, distUpTo: n - 1, yHat,
        paramTones: { [PARAM_LABELS[0]]: "cyan", [PARAM_LABELS[1]]: "cyan" }, lossHistory }),
        `\u2202L/\u2202w\u2081 = ${fmt(dw1, 4)}   \u2202L/\u2202w\u2082 = ${fmt(dw2, 4)}   \u2202L/\u2202b = ${fmt(db, 4)}`),
      { epoch, dw1: Math.round(dw1 * 10000) / 10000,
        dw2: Math.round(dw2 * 10000) / 10000, db: Math.round(db * 10000) / 10000 });

    // --- update ---
    const oldW1 = w1, oldW2 = w2, oldB = b;
    w1 -= lr * dw1;
    w2 -= lr * dw2;
    b -= lr * db;
    push("update", "log.update",
      calc(scene({ w1, w2, b, loss: avgLoss, distUpTo: n - 1, yHat,
        paramTones: { [PARAM_LABELS[0]]: "accent", [PARAM_LABELS[1]]: "accent", b: "accent" },
        lossHistory }),
        `w\u2081: ${fmt(oldW1, 3)} \u2192 ${fmt(w1, 3)}   w\u2082: ${fmt(oldW2, 3)} \u2192 ${fmt(w2, 3)}   b: ${fmt(oldB, 3)} \u2192 ${fmt(b, 3)}`),
      { epoch,
        oldW1: Math.round(oldW1 * 1000) / 1000, oldW2: Math.round(oldW2 * 1000) / 1000,
        w1: Math.round(w1 * 1000) / 1000, w2: Math.round(w2 * 1000) / 1000,
        oldB: Math.round(oldB * 1000) / 1000, b: Math.round(b * 1000) / 1000 });
  }

  // --- done ---
  const finalYHat = normX1.map((nx1, i) => sigmoid(w1 * nx1 + w2 * normX2[i] + b));
  const correct = finalYHat.reduce(
    (s, p, i) => s + (Math.round(p) === points[i].label ? 1 : 0), 0);
  const accuracy = correct / n;
  const finalLoss = finalYHat.reduce(
    (s, p, i) => s - (points[i].label * safeLog(p) +
      (1 - points[i].label) * safeLog(1 - p)), 0) / n;

  push("done", "log.done",
    calc(scene({ w1, w2, b, loss: finalLoss, yHat: finalYHat,
      showResult: true, distUpTo: n - 1, lossHistory }),
      `Accuracy: ${correct}/${n} (${fmt(accuracy * 100, 1)}%)   BCE = ${fmt(finalLoss, 4)}`),
    { w1: Math.round(w1 * 1000) / 1000, w2: Math.round(w2 * 1000) / 1000,
      b: Math.round(b * 1000) / 1000, loss: Math.round(finalLoss * 10000) / 10000,
      accuracy: Math.round(accuracy * 100) / 100, correct, n });

  return frames;
}
