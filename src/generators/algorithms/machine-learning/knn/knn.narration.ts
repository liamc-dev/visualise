// src/generators/algorithms/machine-learning/knn/knn.narration.ts

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

function s(meta: Meta, key: string): string | undefined {
  const v = meta[key];
  return typeof v === "string" ? v : undefined;
}

function b(meta: Meta, key: string): boolean | undefined {
  const v = meta[key];
  return typeof v === "boolean" ? v : undefined;
}

export const KNN_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("KNN narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;
    const qi = n(meta, "qi");
    const predicted = n(meta, "predicted");
    const actual = n(meta, "actual");

    switch (token) {
      case "knn.data":
        return pickMode(mode, {
          explain: `Load ${n(meta, "n") ?? "?"} data points and plot them.`,
          code: `knn_loo(points, labels, k)  // n=${n(meta, "n") ?? "?"}`,
          minimal: "load data",
        });

      case "knn.label":
        return pickMode(mode, {
          explain: `Auto-label ${n(meta, "n") ?? "?"} points by x+y: lower half = class 0, upper half = class 1.`,
          code: `n = ${n(meta, "n") ?? "?"}; correct = 0`,
          minimal: "auto-label",
        });

      case "knn.query":
        return pickMode(mode, {
          explain: `Query point ${qi ?? "?"}: remove from training set, classify by neighbors.`,
          code: `query = points[${qi ?? "?"}]`,
          minimal: `query ${qi ?? "?"}`,
        });

      case "knn.dist.init":
        return pickMode(mode, {
          explain: `Initialize empty distance list for query ${qi ?? "?"}.`,
          code: "dists = []",
          minimal: "init dists",
        });

      case "knn.dist.calc": {
        const j = n(meta, "j");
        const dist = s(meta, "dist");
        return pickMode(mode, {
          explain: `Distance from query ${qi ?? "?"} to point ${j ?? "?"} = ${dist ?? "?"}.`,
          code: `dists.append(dist(q, pt[${j ?? "?"}]))  // ${dist ?? "?"}`,
          minimal: `d(${qi ?? "?"},${j ?? "?"})=${dist ?? "?"}`,
        });
      }

      case "knn.sort":
        return pickMode(mode, {
          explain: "Sort all distances from nearest to farthest.",
          code: "dists.sort()",
          minimal: "sort dists",
        });

      case "knn.select":
        return pickMode(mode, {
          explain: `Select the k=${n(meta, "k") ?? "?"} nearest neighbors.`,
          code: `neighbors = dists[:${n(meta, "k") ?? "?"}]`,
          minimal: `k=${n(meta, "k") ?? "?"} nearest`,
        });

      case "knn.vote": {
        const v0 = n(meta, "votes0");
        const v1 = n(meta, "votes1");
        return pickMode(mode, {
          explain: `Count votes from k neighbors: class 0 = ${v0 ?? "?"}, class 1 = ${v1 ?? "?"}.`,
          code: `votes = [${v0 ?? 0}, ${v1 ?? 0}]`,
          minimal: `votes ${v0 ?? 0}:${v1 ?? 0}`,
        });
      }

      case "knn.decide": {
        const v0 = n(meta, "votes0");
        const v1 = n(meta, "votes1");
        return pickMode(mode, {
          explain: `Majority vote: ${(v1 ?? 0) > (v0 ?? 0) ? "class 1 wins" : "class 0 wins"}. Predict class ${predicted ?? "?"}.`,
          code: `predicted = argmax(votes)  // ${predicted ?? "?"}`,
          minimal: `predict ${predicted ?? "?"}`,
        });
      }

      case "knn.predict": {
        const isCorrect = b(meta, "correct");
        const acc = s(meta, "acc");
        return pickMode(mode, {
          explain: isCorrect
            ? `Correct! Predicted ${predicted ?? "?"} = actual ${actual ?? "?"}. Running accuracy: ${acc ?? "?"}%.`
            : `Wrong. Predicted ${predicted ?? "?"} \u2260 actual ${actual ?? "?"}. Running accuracy: ${acc ?? "?"}%.`,
          code: isCorrect
            ? `predicted == labels[${qi ?? "?"}]  // correct, acc=${acc ?? "?"}%`
            : `predicted != labels[${qi ?? "?"}]  // wrong, acc=${acc ?? "?"}%`,
          minimal: isCorrect ? `\u2713 ${acc ?? "?"}%` : `\u2717 ${acc ?? "?"}%`,
        });
      }

      case "knn.batch": {
        const isCorrect = b(meta, "correct");
        const acc = s(meta, "acc");
        return pickMode(mode, {
          explain: isCorrect
            ? `Query ${qi ?? "?"}: predict ${predicted ?? "?"} = actual ${actual ?? "?"}. Accuracy: ${acc ?? "?"}%.`
            : `Query ${qi ?? "?"}: predict ${predicted ?? "?"} \u2260 actual ${actual ?? "?"}. Accuracy: ${acc ?? "?"}%.`,
          code: `loo[${qi ?? "?"}]: ${isCorrect ? "correct" : "wrong"}  // acc=${acc ?? "?"}%`,
          minimal: isCorrect ? `q${qi ?? "?"} \u2713` : `q${qi ?? "?"} \u2717`,
        });
      }

      case "knn.done": {
        const accuracy = s(meta, "accuracy");
        const correct = n(meta, "correct");
        const total = n(meta, "n");
        return pickMode(mode, {
          explain: `Leave-one-out complete. Accuracy: ${correct ?? "?"}/${total ?? "?"} (${accuracy ?? "?"}%).`,
          code: `return ${correct ?? "?"}/${total ?? "?"}  // ${accuracy ?? "?"}%`,
          minimal: `done ${accuracy ?? "?"}%`,
        });
      }

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing KNN narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default KNN_NARRATION;
