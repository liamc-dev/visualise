// src/generators/algorithms/machine-learning/k-means/kmeans.narration.ts

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

export const KMEANS_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("KMeans narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;
    const iter = n(meta, "iter");
    const changes = n(meta, "changes");
    const pointIdx = n(meta, "pointIdx");
    const cluster = n(meta, "cluster");
    const centroidIdx = n(meta, "centroidIdx");

    switch (token) {
      case "km.data":
        return pickMode(mode, {
          explain: `Load ${n(meta, "n") ?? "?"} data points and plot them on the scatter chart.`,
          code: `kmeans(points, k)  // n=${n(meta, "n") ?? "?"}`,
          minimal: "load data",
        });

      case "km.init":
        return pickMode(mode, {
          explain: `Randomly select ${n(meta, "k") ?? 3} data points as initial centroids.`,
          code: `centroids = random_sample(points, ${n(meta, "k") ?? 3})`,
          minimal: "init centroids",
        });

      case "km.iteration":
        return pickMode(mode, {
          explain: `Start iteration ${iter ?? "?"}.`,
          code: `for iter in range(max_iter)  // iter=${iter ?? "?"}`,
          minimal: `iter ${iter ?? "?"}`,
        });

      case "km.assign":
        return pickMode(mode, {
          explain: "Reset change counter. Assign each point to its nearest centroid.",
          code: "changes = 0",
          minimal: "changes = 0",
        });

      case "km.assign.init":
        return pickMode(mode, {
          explain: `Point ${pointIdx ?? "?"}: begin search for nearest centroid. bestD = \u221e.`,
          code: `nearest = 0; bestD = Infinity  // pt ${pointIdx ?? "?"}`,
          minimal: `pt ${pointIdx ?? "?"}: search`,
        });

      case "km.assign.cmp": {
        const cj = n(meta, "centroidIdx");
        const dist = s(meta, "dist");
        const isBest = b(meta, "isBest");
        return pickMode(mode, {
          explain: isBest
            ? `Distance to C${cj ?? "?"} = ${dist ?? "?"}. New closest!`
            : `Distance to C${cj ?? "?"} = ${dist ?? "?"}. Not closer, skip.`,
          code: isBest
            ? `d = dist(pt, C${cj ?? "?"})  // ${dist ?? "?"} < bestD \u2192 update`
            : `d = dist(pt, C${cj ?? "?"})  // ${dist ?? "?"} \u2265 bestD \u2192 skip`,
          minimal: isBest
            ? `C${cj ?? "?"}: ${dist ?? "?"} \u2713`
            : `C${cj ?? "?"}: ${dist ?? "?"} \u2717`,
        });
      }

      case "km.assign.update": {
        const prev = n(meta, "prevCluster");
        const changed = b(meta, "changed");
        if (changed) {
          return pickMode(mode, {
            explain: `Point ${pointIdx ?? "?"} reassigned: C${prev != null && prev >= 0 ? prev : "?"} \u2192 C${cluster ?? "?"}. changes = ${n(meta, "changes") ?? "?"}.`,
            code: `assign[${pointIdx ?? "?"}] = ${cluster ?? "?"}; changes++  // ${n(meta, "changes") ?? "?"}`,
            minimal: `pt ${pointIdx ?? "?"}: C${prev ?? "?"}\u2192C${cluster ?? "?"}`,
          });
        }
        return pickMode(mode, {
          explain: `Point ${pointIdx ?? "?"} stays in C${cluster ?? "?"}. No change.`,
          code: `assign[${pointIdx ?? "?"}] == ${cluster ?? "?"}  // no change`,
          minimal: `pt ${pointIdx ?? "?"}: stay`,
        });
      }

      case "km.update":
        return pickMode(mode, {
          explain: "Recompute each centroid as the mean of its assigned points.",
          code: "for j in range(k):",
          minimal: "update centroids",
        });

      case "km.update.init":
        return pickMode(mode, {
          explain: `Centroid C${centroidIdx ?? "?"}: initialize sums to zero.`,
          code: `sx, sy, cnt = 0, 0, 0  // C${centroidIdx ?? "?"}`,
          minimal: `C${centroidIdx ?? "?"}: init`,
        });

      case "km.update.acc": {
        const cnt = n(meta, "cnt");
        const sx = s(meta, "sx");
        const sy = s(meta, "sy");
        return pickMode(mode, {
          explain: `Point ${pointIdx ?? "?"} belongs to C${centroidIdx ?? "?"}. Running sum = (${sx ?? "?"}, ${sy ?? "?"}), count = ${cnt ?? "?"}.`,
          code: `sx += ${pointIdx ?? "?"}.x; sy += ${pointIdx ?? "?"}.y; cnt=${cnt ?? "?"}`,
          minimal: `+pt ${pointIdx ?? "?"} cnt=${cnt ?? "?"}`,
        });
      }

      case "km.update.mean": {
        const cnt = n(meta, "count");
        const cx = s(meta, "cx");
        const cy = s(meta, "cy");
        return pickMode(mode, {
          explain: `C${centroidIdx ?? "?"} = mean of ${cnt ?? "?"} points \u2192 (${cx ?? "?"}, ${cy ?? "?"}).`,
          code: `centroid[${centroidIdx ?? "?"}] = (${cx ?? "?"}/${cnt ?? "?"}, ${cy ?? "?"}/${cnt ?? "?"})`,
          minimal: `C${centroidIdx ?? "?"}\u2192(${cx ?? "?"},${cy ?? "?"})`,
        });
      }

      case "km.check":
        return pickMode(mode, {
          explain: changes === 0
            ? "No assignments changed \u2014 converged!"
            : `${changes ?? "?"} assignments changed. Continue iterating.`,
          code: changes === 0
            ? "changes == 0 \u2192 break"
            : `changes = ${changes ?? "?"} \u2192 continue`,
          minimal: changes === 0 ? "converged" : `${changes ?? "?"} chg`,
        });

      case "km.done":
        return pickMode(mode, {
          explain: `Clustering complete after ${iter ?? "?"} iterations. ${n(meta, "k") ?? 3} clusters formed.`,
          code: `return assign, centroids  // ${iter ?? "?"} iters`,
          minimal: "done",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing kmeans narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default KMEANS_NARRATION;
