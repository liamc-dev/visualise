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

    const source = s(meta, "source");
    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const dist = n(meta, "dist");
    const tentative = n(meta, "tentative");
    const currentDist = meta.currentDist;
    const oldDist = meta.oldDist;
    const newDist = n(meta, "newDist");
    const unvisitedCount = n(meta, "unvisitedCount");
    const result = s(meta, "result");

    switch (token) {
      /* ---------- Init phase (4 frames) ---------- */

      case "dj.init.dist":
        return pickMode(mode, {
          explain: `Create distance array. Set every node to \u221e.`,
          code: "dist = {\u221e}",
          minimal: "init dist",
        });

      case "dj.init.prev":
        return pickMode(mode, {
          explain: "Create predecessor array. All entries null.",
          code: "prev = {null}",
          minimal: "init prev",
        });

      case "dj.init.visited":
        return pickMode(mode, {
          explain: "Create empty visited set.",
          code: "visited = {}",
          minimal: "init visited",
        });

      case "dj.init.setdist":
        return pickMode(mode, {
          explain: `Set distance of source ${source ?? "?"} to 0.`,
          code: "dist[src] = 0",
          minimal: `dist[${source ?? "?"}]=0`,
        });

      /* ---------- Main loop ---------- */

      case "dj.loop":
        return pickMode(mode, {
          explain:
            unvisitedCount !== undefined
              ? `${unvisitedCount} unvisited node${unvisitedCount === 1 ? "" : "s"} remain.`
              : "Check loop condition.",
          code: "while |visited| < |V|",
          minimal: `loop (${unvisitedCount ?? "?"} left)`,
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

      /* ---------- Neighbor exploration ---------- */

      case "dj.neighbors":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Consider neighbor ${v} of ${u} (edge weight ${w}).`
              : "Iterate to next neighbor.",
          code: "for (v, w) in adj[u]",
          minimal: `nb ${v ?? "?"}`,
        });

      case "dj.check.visited":
        return pickMode(mode, {
          explain:
            result === "fail"
              ? `${v ?? "?"} is already visited \u2014 skip.`
              : `${v ?? "?"} is not visited \u2014 proceed to relax.`,
          code: result === "fail" ? "visited[v] \u2192 skip" : "!visited[v]",
          minimal: result === "fail" ? `${v ?? "?"} visited` : `${v ?? "?"} ok`,
        });

      case "dj.relax":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined && tentative !== undefined
              ? `Tentative distance: dist[${u}] + ${w} = ${tentative}. Compare with dist[${v}] = ${currentDist === Infinity ? "\u221e" : currentDist}.`
              : "Compute tentative distance and compare.",
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
              ? `No improvement for ${v} (current ${currentDist} \u2264 tentative ${tentative}).`
              : "No improvement for neighbor.",
          code: "// no update",
          minimal: "skip",
        });

      /* ---------- Finalize ---------- */

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
          explain: "All reachable nodes visited. Shortest path tree complete.",
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
