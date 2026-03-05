// src/generators/algorithms/machine-learning/logistic-regression/logreg.narration.ts

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

function bool(meta: Meta, key: string): boolean | undefined {
  const v = meta[key];
  return typeof v === "boolean" ? v : undefined;
}

export const LOGREG_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("LogReg narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;
    const epoch = n(meta, "epoch");
    const w1 = n(meta, "w1");
    const w2 = n(meta, "w2");
    const b = n(meta, "b");
    const loss = n(meta, "loss");

    switch (token) {
      case "log.data":
        return pickMode(mode, {
          explain:
            `Load ${n(meta, "n") ?? "?"} data points. Auto-label by x\u2081+x\u2082 median: ` +
            `cyan dots = class 0, gold dots = class 1. ` +
            `The goal: find a line that separates the two classes.`,
          code: `fit(X1, X2, Y, lr, epochs)  // n=${n(meta, "n") ?? "?"}`,
          minimal: "load data",
        });

      case "log.init":
        return pickMode(mode, {
          explain:
            "Initialize w\u2081 = 0, w\u2082 = 0, b = 0. " +
            "With all weights zero, every point gets \u03c3(0) = 0.5 \u2014 " +
            "the model starts by guessing 50/50 for everything.",
          code: "w1, w2, b = 0, 0, 0",
          minimal: "init params",
        });

      case "log.epoch":
        return pickMode(mode, {
          explain: `Start epoch ${epoch ?? "?"}.`,
          code: `for epoch in range(${epoch ?? "?"})`,
          minimal: `epoch ${epoch ?? "?"}`,
        });

      case "log.predict":
        return pickMode(mode, {
          explain:
            "Compute \u0177 = \u03c3(w\u2081x\u2081 + w\u2082x\u2082 + b) for all points. " +
            "The sigmoid squashes any real number into [0, 1], " +
            "giving us a probability of belonging to class 1.",
          code: "for i in range(n): y_hat[i] = sigmoid(w1*X1[i] + w2*X2[i] + b)",
          minimal: "predict all",
        });

      case "log.predict.step": {
        const idx = n(meta, "pointIdx");
        const prob = n(meta, "prob");
        const label = n(meta, "label");
        const correct = bool(meta, "correct");
        const verdict = correct === true ? "Correct \u2714" : correct === false ? "Wrong \u2718" : "";
        const confidence = prob != null
          ? (prob > 0.8 || prob < 0.2 ? "confident" : prob > 0.6 || prob < 0.4 ? "leaning" : "uncertain")
          : "";
        return pickMode(mode, {
          explain:
            `Point ${idx ?? "?"}: \u0177 = ${prob ?? "?"} (${confidence}, class ${label ?? "?"}). ${verdict} ` +
            `\u2014 ${prob != null && prob > 0.4 && prob < 0.6 ? "near 0.5 means the model is unsure." : ""}`,
          code: `y_hat[${idx ?? "?"}] = sigmoid(z)  // ${prob ?? "?"} ${verdict}`,
          minimal: `pt ${idx ?? "?"}: ${prob ?? "?"} ${verdict}`,
        });
      }

      case "log.loss.step": {
        const idx = n(meta, "pointIdx");
        const li = n(meta, "li");
        const sum = n(meta, "sum");
        const nVal = n(meta, "n");
        const prob = n(meta, "prob");
        const label = n(meta, "label");
        if (idx != null) {
          // Explain why BCE penalises confident-wrong predictions heavily
          const isHighLoss = li != null && li > 1;
          const insight = isHighLoss
            ? "High loss \u2014 BCE punishes confident wrong predictions severely."
            : li != null && li < 0.3
              ? "Low loss \u2014 prediction close to the true label."
              : "";
          return pickMode(mode, {
            explain:
              `Point ${idx}: y=${label ?? "?"}, \u0177=${prob ?? "?"}. ` +
              `BCE = ${li ?? "?"}. ${insight} Sum = ${sum ?? "?"}.`,
            code: `loss -= y[${idx}]*log(yh) + (1-y[${idx}])*log(1-yh)  // ${li ?? "?"}`,
            minimal: `pt ${idx}: +${li ?? "?"}`,
          });
        }
        return pickMode(mode, {
          explain:
            `Sum binary cross-entropy across all ${nVal ?? "n"} points. ` +
            `BCE uses log: predicting 0.01 for a class-1 point costs far more than predicting 0.4.`,
          code: "loss -= y*log(yh) + (1-y)*log(1-yh)",
          minimal: "sum BCE",
        });
      }

      case "log.loss.avg": {
        const nVal = n(meta, "n");
        return pickMode(mode, {
          explain: `Divide by n = ${nVal ?? "?"}. Average BCE = ${loss ?? "?"}.`,
          code: `loss /= ${nVal ?? "n"}  // ${loss ?? "?"}`,
          minimal: `loss ${loss ?? "?"}`,
        });
      }

      case "log.grad.step":
        return pickMode(mode, {
          explain:
            "Accumulate error (\u0177 \u2212 y) per point. " +
            "Unlike MSE, logistic regression gradients are simple: " +
            "just the difference times the feature value.",
          code: "dw1 += err*X1[i]; dw2 += err*X2[i]; db += err",
          minimal: "accumulate",
        });

      case "log.grad.scale": {
        const dw1 = n(meta, "dw1");
        const dw2 = n(meta, "dw2");
        const db = n(meta, "db");
        return pickMode(mode, {
          explain:
            `Scale by 1/n. ` +
            `\u2202L/\u2202w\u2081 = ${dw1 ?? "?"}, \u2202L/\u2202w\u2082 = ${dw2 ?? "?"}, \u2202L/\u2202b = ${db ?? "?"}. ` +
            `These point the direction of steepest loss increase.`,
          code: `dw1 /= n; dw2 /= n; db /= n  // ${dw1 ?? "?"}, ${dw2 ?? "?"}, ${db ?? "?"}`,
          minimal: "scale grad",
        });
      }

      case "log.update": {
        const oldW1 = n(meta, "oldW1");
        const oldW2 = n(meta, "oldW2");
        const hasOld = oldW1 != null && oldW2 != null;
        return pickMode(mode, {
          explain: hasOld
            ? `Update: w\u2081 ${oldW1} \u2192 ${w1 ?? "?"}, w\u2082 ${oldW2} \u2192 ${w2 ?? "?"}. ` +
              `The decision boundary rotates and shifts to better separate the classes.`
            : `Update: w\u2081 = ${w1 ?? "?"}, w\u2082 = ${w2 ?? "?"}, b = ${b ?? "?"}.`,
          code: `w1 -= lr * dw1  // ${oldW1 ?? "?"} \u2192 ${w1 ?? "?"}`,
          minimal: "update",
        });
      }

      case "log.done": {
        const accuracy = n(meta, "accuracy");
        const correct = n(meta, "correct");
        const nVal = n(meta, "n");
        const misclassified = (correct != null && nVal != null) ? nVal - correct : null;
        return pickMode(mode, {
          explain:
            `Training complete. ${correct ?? "?"}/${nVal ?? "?"} correct ` +
            `(${accuracy != null ? (accuracy * 100).toFixed(1) : "?"}%). ` +
            `${misclassified != null && misclassified > 0 ? `${misclassified} misclassified (shown in red). ` : ""}` +
            `The boundary sits where \u03c3(z) = 0.5, meaning the model is equally unsure about both classes.`,
          code: `return w1=${w1 ?? "?"}, w2=${w2 ?? "?"}, b=${b ?? "?"}`,
          minimal: "done",
        });
      }

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing logreg narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default LOGREG_NARRATION;
