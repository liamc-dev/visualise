import type { NarrationBundle, NarrationMode } from "../../../../types/algo-types";

function pickMode(
  mode: NarrationMode,
  m: { explain: string; code: string; minimal: string },
) {
  return m[mode] ?? m.explain;
}

type Meta = Record<string, unknown>;

function s(meta: Meta, key: string): string | undefined {
  const v = meta[key];
  return typeof v === "string" ? v : undefined;
}

function n(meta: Meta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === "number" ? v : undefined;
}

export const BELLMAN_FORD_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("BellmanFord narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const source = s(meta, "source");
    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const pass = n(meta, "pass");
    const total = n(meta, "total");
    const tentative = n(meta, "tentative");
    const currentDist = meta.currentDist;
    const oldDist = meta.oldDist;
    const newDist = n(meta, "newDist");

    switch (token) {
      case "bf.init":
        return pickMode(mode, {
          explain:
            `Initialize all distances to \u221e. ${n(meta, "V") ?? "?"} nodes, source is ${source ?? "?"}.`,
          code: "dist = {\u221e}",
          minimal: "init dist",
        });

      case "bf.source":
        return pickMode(mode, {
          explain:
            `Set dist[${source ?? "?"}] = 0 \u2014 source has zero cost.`,
          code: "dist[src] = 0",
          minimal: `dist[${source ?? "?"}]=0`,
        });

      case "bf.pass":
        return pickMode(mode, {
          explain:
            `Pass ${pass ?? "?"} of ${total ?? "?"} \u2014 relax all edges.`,
          code: `for i = 1 to V-1 // pass ${pass ?? "?"}`,
          minimal: `pass ${pass ?? "?"}/${total ?? "?"}`,
        });

      case "bf.edge":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Consider edge ${u}\u2192${v} with weight ${w}.`
              : "Pick next edge.",
          code: `for (u, v, w) in edges // ${u ?? "?"}\u2192${v ?? "?"}`,
          minimal: `edge ${u ?? "?"}\u2192${v ?? "?"}`,
        });

      case "bf.relax": {
        const curBest = currentDist === Infinity ? "\u221e" : currentDist;
        const improved = typeof tentative === "number" && typeof currentDist === "number"
          ? tentative < currentDist
          : typeof tentative === "number" && currentDist === Infinity;
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined && tentative !== undefined
              ? `dist[${u}] + ${w} = ${tentative}. dist[${v}] = ${curBest}. ${improved ? `${tentative} < ${curBest} \u2014 shorter path!` : "No improvement."}`
              : "Compute tentative distance and compare.",
          code: `if dist[${u ?? "?"}]+${w ?? "?"} < dist[${v ?? "?"}]`,
          minimal: `relax ${u ?? "?"}\u2192${v ?? "?"}`,
        });
      }

      case "bf.skip":
        return pickMode(mode, {
          explain:
            v !== undefined && currentDist !== undefined && tentative !== undefined
              ? `No improvement for ${v} (current ${currentDist} \u2264 tentative ${tentative}).`
              : "No improvement for this edge.",
          code: "// no update",
          minimal: "skip",
        });

      case "bf.update":
        return pickMode(mode, {
          explain:
            v !== undefined && oldDist !== undefined && newDist !== undefined && u !== undefined
              ? `Shorter path found! Update ${v}: ${oldDist} \u2192 ${newDist} via ${u}.`
              : "Update distance.",
          code: `dist[${v ?? "?"}] = ${newDist ?? "?"}`,
          minimal: `${v ?? "?"}=${newDist ?? "?"}`,
        });

      case "bf.done":
        return pickMode(mode, {
          explain:
            `Bellman-Ford complete \u2014 all shortest distances from source are final.`,
          code: "return dist",
          minimal: "done",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing bellman-ford narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default BELLMAN_FORD_NARRATION;
