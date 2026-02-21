// src/generators/algorithms/pathfinding/dijkstra/dijkstra.narration.ts
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

export const DIJKSTRA_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("Dijkstra narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const dist = n(meta, "dist");
    const tentative = n(meta, "tentative");
    const currentDist = meta.currentDist;
    const oldDist = meta.oldDist;
    const newDist = n(meta, "newDist");

    switch (token) {
      case "dj.init":
        return pickMode(mode, {
          explain:
            `Initialize distances: source ${s(meta, "source") ?? "A"} = 0, all others = \u221e.`,
          code: "dist = {\u221e}; dist[src] = 0",
          minimal: "init",
        });

      case "dj.pick":
        return pickMode(mode, {
          explain:
            u !== undefined && dist !== undefined
              ? `Pick ${u} with minimum distance ${dist}.`
              : "Pick unvisited node with minimum distance.",
          code: "u = minDist(unvisited)",
          minimal: `pick ${u ?? "?"}`,
        });

      case "dj.relax":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined && tentative !== undefined
              ? `Consider edge ${u}\u2192${v} (weight ${w}). Tentative: ${tentative}.`
              : "Consider edge to neighbor.",
          code: "if dist[u]+w < dist[v]",
          minimal: `relax ${u ?? "?"}\u2192${v ?? "?"}`,
        });

      case "dj.update":
        return pickMode(mode, {
          explain:
            v !== undefined && oldDist !== undefined && newDist !== undefined && u !== undefined
              ? `Update ${v}: distance ${oldDist} \u2192 ${newDist} via ${u}.`
              : "Update neighbor distance.",
          code: "dist[v] = dist[u]+w",
          minimal: `${v ?? "?"}=${newDist ?? "?"}`,
        });

      case "dj.skip":
        return pickMode(mode, {
          explain:
            v !== undefined && currentDist !== undefined && tentative !== undefined
              ? `No improvement for ${v} (current ${currentDist} \u2264 ${tentative}).`
              : "No improvement for neighbor.",
          code: "// no update",
          minimal: "skip",
        });

      case "dj.visit":
        return pickMode(mode, {
          explain:
            u !== undefined && dist !== undefined
              ? `Mark ${u} as visited. Distance ${dist} is final.`
              : "Mark node as visited.",
          code: "visited.add(u)",
          minimal: `done ${u ?? "?"}`,
        });

      case "dj.done":
        return pickMode(mode, {
          explain: "All nodes visited. Shortest path tree complete.",
          code: "return dist",
          minimal: "done",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing dijkstra narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default DIJKSTRA_NARRATION;
