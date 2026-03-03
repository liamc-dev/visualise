// src/generators/algorithms/machine-learning/linear-regression/linreg.narration.ts

import type { NarrationBundle, NarrationMode } from "../../../../types/algo-types";

function pickMode(
  mode: NarrationMode,
  m: { explain: string; code: string; minimal: string },
) {
  return m[mode] ?? m.explain;
}

type Meta = Record<string, unknown>;

function n(meta: Meta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === "number" ? v : undefined;
}

export const LINREG_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("LinReg narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;
    const epoch = n(meta, "epoch");
    const m = n(meta, "m");
    const b = n(meta, "b");
    const loss = n(meta, "loss");
    const dm = n(meta, "dm");
    const db = n(meta, "db");

    switch (token) {
      case "reg.data":
        return pickMode(mode, {
          explain: `Load ${n(meta, "n") ?? "?"} training data points (X, Y) and plot them.`,
          code: `fit(X, Y, lr, epochs)  // n=${n(meta, "n") ?? "?"}`,
          minimal: "load data",
        });

      case "reg.init":
        return pickMode(mode, {
          explain: "Initialize slope m = 0 and intercept b = 0. The line starts flat.",
          code: "m, b = 0, 0",
          minimal: "init params",
        });

      case "reg.epoch":
        return pickMode(mode, {
          explain: `Start epoch ${epoch ?? "?"}.`,
          code: `for epoch in range(${epoch ?? "?"})`,
          minimal: `epoch ${epoch ?? "?"}`,
        });

      case "reg.predict":
        return pickMode(mode, {
          explain: "Compute predictions \u0177 = mx + b for all points. Residuals show the error.",
          code: "for i in range(n): yHat[i] = m * X[i] + b",
          minimal: "predict all",
        });

      case "reg.predict.step": {
        const idx = n(meta, "pointIdx");
        const px = n(meta, "pointX");
        const py = n(meta, "pointY");
        const yh = n(meta, "yHat");
        const err = n(meta, "error");
        return pickMode(mode, {
          explain:
            `Point ${idx ?? "?"}: \u0177 = ${m ?? "??"}\u00b7${px ?? "?"} + ${b ?? "?"} = ${yh ?? "?"}. ` +
            `Actual y = ${py ?? "?"}, error = ${err ?? "?"}.`,
          code: `yHat[${idx ?? "?"}] = m * ${px ?? "?"} + b  // ${yh ?? "?"}`,
          minimal: `pt ${idx ?? "?"}: \u0177=${yh ?? "?"}`,
        });
      }

      case "reg.grad.step":
        return pickMode(mode, {
          explain: "Accumulate error for each point into gradient sums dm, db.",
          code: "dm += X[i]*(Y[i]-yHat[i]); db += (Y[i]-yHat[i])",
          minimal: "accumulate",
        });

      case "reg.grad.scale":
        return pickMode(mode, {
          explain:
            `Scale by -2/n. Gradients: \u2202L/\u2202m = ${dm ?? "?"}, \u2202L/\u2202b = ${db ?? "?"}.`,
          code: `dm *= -2/n  // ${dm ?? "?"};  db *= -2/n  // ${db ?? "?"}`,
          minimal: "scale grad",
        });

      case "reg.update": {
        const oldM = n(meta, "oldM");
        const oldB = n(meta, "oldB");
        const hasOld = oldM != null && oldB != null;
        return pickMode(mode, {
          explain: hasOld
            ? `Update: m ${oldM} \u2192 ${m ?? "?"}, b ${oldB} \u2192 ${b ?? "?"}. Line shifts to fit data.`
            : `Update parameters: m = ${m ?? "?"}, b = ${b ?? "?"}.`,
          code: `m -= lr * dm  // ${oldM ?? "?"} \u2192 ${m ?? "?"}`,
          minimal: "update",
        });
      }

      case "reg.loss.step": {
        const idx = n(meta, "pointIdx");
        const sq = n(meta, "sq");
        const sum = n(meta, "sum");
        const nVal = n(meta, "n");
        if (idx != null) {
          return pickMode(mode, {
            explain: `Point ${idx}: squared error = ${sq ?? "?"}. Running sum = ${sum ?? "?"}.`,
            code: `loss += (Y[${idx}] - yHat[${idx}])²  // ${sq ?? "?"}, sum=${sum ?? "?"}`,
            minimal: `pt ${idx}: +${sq ?? "?"}`,
          });
        }
        return pickMode(mode, {
          explain: `Sum squared errors (ŷᵢ − yᵢ)² across all ${nVal ?? "n"} points.`,
          code: "loss += (Y[i] - yHat[i])²",
          minimal: "sum errors",
        });
      }

      case "reg.loss.avg": {
        const nVal = n(meta, "n");
        return pickMode(mode, {
          explain: `Divide by n = ${nVal ?? "?"} to get mean. MSE = ${loss ?? "?"} at epoch ${epoch ?? "?"}.`,
          code: `loss /= ${nVal ?? "n"}  // ${loss ?? "?"}`,
          minimal: `loss ${loss ?? "?"}`,
        });
      }

      case "reg.done":
        return pickMode(mode, {
          explain:
            `Training complete. Final: m = ${m ?? "?"}, b = ${b ?? "?"}, loss = ${loss ?? "?"}.`,
          code: `return m=${m ?? "?"}, b=${b ?? "?"}`,
          minimal: "done",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing linreg narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default LINREG_NARRATION;
