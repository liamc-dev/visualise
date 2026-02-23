// src/generators/algorithms/pathfinding/a-star/a-star.narration.ts
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

export const ASTAR_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("A* narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const source = s(meta, "source");
    const goal = s(meta, "goal");
    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const gScore = n(meta, "g");
    const fScore = n(meta, "f");
    const hScore = n(meta, "h");
    const tentG = n(meta, "tentG");
    const currentG = meta.currentG;
    const oldG = meta.oldG;
    const newG = n(meta, "newG");
    const newF = n(meta, "newF");
    const unvisitedCount = n(meta, "unvisitedCount");
    const result = s(meta, "result");

    switch (token) {
      /* ---------- Init phase ---------- */

      case "as.init.g":
        return pickMode(mode, {
          explain: "Create g-score grid (cost from start). Each cell's weight is the cost to step into it. Start all at \u221e (unreached).",
          code: "g = {\u221e}",
          minimal: "init g",
        });

      case "as.init.f":
        return pickMode(mode, {
          explain: "Create f-score grid (estimated total cost = g + h). Start all at \u221e.",
          code: "f = {\u221e}",
          minimal: "init f",
        });

      case "as.init.visited":
        return pickMode(mode, {
          explain: "Create visited array \u2014 tracks which cells are finalised.",
          code: "visited = {}",
          minimal: "init visited",
        });

      case "as.init.setg":
        return pickMode(mode, {
          explain: source !== undefined && goal !== undefined
            ? `Source ${source} costs 0 to reach. f = 0 + h = ${fScore ?? "?"}. Goal is ${goal}.`
            : `Set g[source] = 0, f[source] = h(source).`,
          code: "g[src]=0; f[src]=h(src)",
          minimal: `g[${source ?? "?"}]=0`,
        });

      /* ---------- Main loop ---------- */

      case "as.loop":
        return pickMode(mode, {
          explain:
            unvisitedCount !== undefined
              ? `${unvisitedCount} unvisited cell${unvisitedCount === 1 ? "" : "s"} remain.`
              : "Check loop condition.",
          code: "while |visited| < |V|",
          minimal: `loop (${unvisitedCount ?? "?"} left)`,
        });

      case "as.pick":
        return pickMode(mode, {
          explain:
            u !== undefined && fScore !== undefined && gScore !== undefined
              ? `Pick ${u} \u2014 lowest f-score (${fScore}). g = ${gScore}, h = ${hScore ?? "?"}.`
              : "Pick unvisited cell with minimum f-score.",
          code: "u = minF(open)",
          minimal: `pick ${u ?? "?"}`,
        });

      case "as.goal":
        return pickMode(mode, {
          explain:
            result === "found"
              ? `${u ?? "?"} is the goal! Shortest path found.`
              : `${u ?? "?"} is not the goal \u2014 keep searching.`,
          code: result === "found" ? "u == goal \u2192 done" : "u != goal",
          minimal: result === "found" ? "goal found!" : "not goal",
        });

      /* ---------- Neighbor exploration ---------- */

      case "as.neighbors":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Check neighbor ${v} \u2014 weight ${w} (costs ${w} to step in).`
              : "Iterate to next neighbor.",
          code: "for (dr,dc) in DIRS",
          minimal: `nb ${v ?? "?"}`,
        });

      case "as.check.visited":
        return pickMode(mode, {
          explain:
            result === "fail"
              ? `${v ?? "?"} already visited \u2014 skip.`
              : `${v ?? "?"} not visited \u2014 check if we found a cheaper path.`,
          code: result === "fail" ? "visited[v] \u2192 skip" : "!visited[v]",
          minimal: result === "fail" ? `${v ?? "?"} visited` : `${v ?? "?"} ok`,
        });

      case "as.relax": {
        const curBest = currentG === Infinity ? "\u221e" : currentG;
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined && tentG !== undefined
              ? `Path through ${u}: g = ${gScore ?? "?"} + weight ${w} = ${tentG}. ${v} currently g = ${curBest}. ${tentG < (typeof currentG === "number" ? currentG : Infinity) ? `${tentG} < ${curBest} \u2014 cheaper!` : `${tentG} \u2265 ${curBest} \u2014 no improvement.`}`
              : "Compute tentative g-score and compare.",
          code: "if g[u]+w < g[v]",
          minimal: `relax ${u ?? "?"}\u2192${v ?? "?"}`,
        });
      }

      case "as.update":
        return pickMode(mode, {
          explain:
            v !== undefined && oldG !== undefined && newG !== undefined && newF !== undefined
              ? `Update ${v}: g ${oldG} \u2192 ${newG}, f = ${newF} (g + h = ${newG} + ${hScore ?? "?"}).`
              : "Update neighbor g-score and f-score.",
          code: "g[v]=tentG; f[v]=tentG+h",
          minimal: `${v ?? "?"}=${newG ?? "?"}`,
        });

      case "as.skip":
        return pickMode(mode, {
          explain:
            v !== undefined && currentG !== undefined && tentG !== undefined
              ? `No shortcut \u2014 ${v} already has a cheaper g-score (${currentG} \u2264 ${tentG}).`
              : "No improvement for neighbor.",
          code: "// no update",
          minimal: "skip",
        });

      /* ---------- Finalize ---------- */

      case "as.visit":
        return pickMode(mode, {
          explain:
            u !== undefined && gScore !== undefined
              ? `Mark ${u} visited. Final g-score: ${gScore}.`
              : "Mark cell as visited.",
          code: "visited[r][c] = true",
          minimal: `done ${u ?? "?"}`,
        });

      case "as.done": {
        const pathLen = n(meta, "pathLen");
        const pathCost = n(meta, "pathCost");
        const noPath = meta.noPath === true;
        if (noPath) {
          return pickMode(mode, {
            explain: "A* complete \u2014 goal is unreachable. No path exists.",
            code: "return \u2205",
            minimal: "no path",
          });
        }
        return pickMode(mode, {
          explain:
            pathLen !== undefined && pathCost !== undefined
              ? `A* complete \u2014 shortest path found! ${pathLen} cells, total cost ${pathCost}.`
              : "A* complete \u2014 shortest path found.",
          code: "return path",
          minimal:
            pathCost !== undefined
              ? `done \u2014 cost ${pathCost}`
              : "done",
        });
      }

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing A* narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default ASTAR_NARRATION;
