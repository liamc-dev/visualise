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

/** Grid coords look like "(0,1)", graph nodes are letters like "A". */
function isGrid(u: string | undefined): boolean {
  return u !== undefined && u.startsWith("(");
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
    const grid = isGrid(u) || isGrid(source);

    switch (token) {
      /* ---------- Init phase ---------- */

      case "dj.init.dist":
        return pickMode(mode, {
          explain: grid
            ? "Create distance grid. Each cell's weight is the cost to step into it. Distance = sum of weights along the path. Start all at \u221e (unreached)."
            : "Create distance array. Set every node to \u221e.",
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
          explain: "Create visited array \u2014 tracks which cells are finalised.",
          code: "visited = {}",
          minimal: "init visited",
        });

      case "dj.init.setdist":
        return pickMode(mode, {
          explain: grid
            ? `Source ${source ?? "?"} costs 0 to reach \u2014 it's our starting point.`
            : `Set distance of source ${source ?? "?"} to 0.`,
          code: "dist[src] = 0",
          minimal: `dist[${source ?? "?"}]=0`,
        });

      /* ---------- Main loop ---------- */

      case "dj.loop":
        return pickMode(mode, {
          explain:
            unvisitedCount !== undefined
              ? `${unvisitedCount} unvisited cell${unvisitedCount === 1 ? "" : "s"} remain.`
              : "Check loop condition.",
          code: "while |visited| < |V|",
          minimal: `loop (${unvisitedCount ?? "?"} left)`,
        });

      case "dj.pick":
        return pickMode(mode, {
          explain:
            u !== undefined && dist !== undefined
              ? grid
                ? `Pick ${u} \u2014 the unvisited cell with cheapest total cost (${dist}). This cost is now final.`
                : `Pick ${u} with minimum distance ${dist}.`
              : "Pick unvisited cell with minimum distance.",
          code: "u = minDist(unvisited)",
          minimal: `pick ${u ?? "?"}`,
        });

      /* ---------- Neighbor exploration ---------- */

      case "dj.neighbors":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? grid
                ? `Check neighbor ${v} \u2014 weight ${w} (costs ${w} to step in).`
                : `Consider neighbor ${v} of ${u} (edge weight ${w}).`
              : "Iterate to next neighbor.",
          code: grid ? "for (dr,dc) in DIRS" : "for (v, w) in adj[u]",
          minimal: `nb ${v ?? "?"}`,
        });

      case "dj.check.visited":
        return pickMode(mode, {
          explain:
            result === "fail"
              ? `${v ?? "?"} already visited \u2014 skip.`
              : `${v ?? "?"} not visited \u2014 check if we found a cheaper path.`,
          code: result === "fail" ? "visited[v] \u2192 skip" : "!visited[v]",
          minimal: result === "fail" ? `${v ?? "?"} visited` : `${v ?? "?"} ok`,
        });

      case "dj.relax": {
        const uDist = n(meta, "uDist");
        const curBest = currentDist === Infinity ? "\u221e" : currentDist;
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined && tentative !== undefined
              ? grid
                ? `Path through ${u}: ${uDist ?? "?"} + weight ${w} = ${tentative}. ${v} currently ${curBest}. ${tentative < (typeof currentDist === "number" ? currentDist : Infinity) ? `${tentative} < ${curBest} \u2014 cheaper!` : `${tentative} \u2265 ${curBest} \u2014 no improvement.`}`
                : `Tentative: dist[${u}] + ${w} = ${tentative}. Current dist[${v}] = ${curBest}.`
              : "Compute tentative distance and compare.",
          code: "if dist[u]+w < dist[v]",
          minimal: `relax ${u ?? "?"}\u2192${v ?? "?"}`,
        });
      }

      case "dj.update":
        return pickMode(mode, {
          explain:
            v !== undefined && oldDist !== undefined && newDist !== undefined && u !== undefined
              ? grid
                ? `Cheaper path found! Update ${v}: cost ${oldDist} \u2192 ${newDist} (via ${u}).`
                : `Update ${v}: distance ${oldDist} \u2192 ${newDist} via ${u}.`
              : "Update neighbor distance.",
          code: "dist[v] = dist[u]+w",
          minimal: `${v ?? "?"}=${newDist ?? "?"}`,
        });

      case "dj.skip":
        return pickMode(mode, {
          explain:
            v !== undefined && currentDist !== undefined && tentative !== undefined
              ? grid
                ? `No shortcut \u2014 ${v} already has a cheaper path (${currentDist} \u2264 ${tentative}).`
                : `No improvement for ${v} (current ${currentDist} \u2264 tentative ${tentative}).`
              : "No improvement for neighbor.",
          code: "// no update",
          minimal: "skip",
        });

      /* ---------- Finalize ---------- */

      case "dj.visit":
        return pickMode(mode, {
          explain:
            u !== undefined && dist !== undefined
              ? grid
                ? `Mark ${u} visited. Final cost: ${dist}.`
                : `Mark ${u} as visited. Distance ${dist} is final.`
              : "Mark cell as visited.",
          code: "visited[r][c] = true",
          minimal: `done ${u ?? "?"}`,
        });

      case "dj.done": {
        const totalVisited = n(meta, "totalVisited");
        return pickMode(mode, {
          explain:
            totalVisited !== undefined
              ? `Dijkstra complete \u2014 ${totalVisited} cell${totalVisited === 1 ? "" : "s"} reached. Each cell shows its cheapest total cost from the source.`
              : "All reachable nodes visited. Shortest distances complete.",
          code: "return dist",
          minimal:
            totalVisited !== undefined
              ? `done \u2014 ${totalVisited} reached`
              : "done",
        });
      }

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
