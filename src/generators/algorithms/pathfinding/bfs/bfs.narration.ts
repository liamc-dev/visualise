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

function coord(meta: Meta, rKey: string, cKey: string): string {
  const r = n(meta, rKey);
  const c = n(meta, cKey);
  if (r !== undefined && c !== undefined) return `(${r},${c})`;
  return "(?,?)";
}

export const BFS_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("BFS narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const qSize = n(meta, "queueSize");
    const lv = n(meta, "level");
    const dir = s(meta, "dir");
    const totalVisited = n(meta, "totalVisited");
    const pass = s(meta, "result") === "pass";

    switch (token) {
      case "bfs.init.queue":
        return pickMode(mode, {
          explain: "Create an empty queue for BFS exploration.",
          code: "queue = new Queue()",
          minimal: "create queue",
        });

      case "bfs.init.visited":
        return pickMode(mode, {
          explain: "Initialize all cells as unvisited.",
          code: "visited = [[false] ...]",
          minimal: "init visited",
        });

      case "bfs.init.level":
        return pickMode(mode, {
          explain: "Initialize all levels to \u22121 (unreached).",
          code: "level = [[-1] ...]",
          minimal: "init levels",
        });

      case "bfs.init.mark":
        return pickMode(mode, {
          explain: `Mark ${coord(meta, "sr", "sc")} as visited.`,
          code: `visited[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = true`,
          minimal: "mark source",
        });

      case "bfs.init.setlevel":
        return pickMode(mode, {
          explain: `Set level of ${coord(meta, "sr", "sc")} to 0.`,
          code: `level[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = 0`,
          minimal: "source level 0",
        });

      case "bfs.init.enqueue":
        return pickMode(mode, {
          explain: `Enqueue source cell ${coord(meta, "sr", "sc")}.`,
          code: `queue.enqueue(${coord(meta, "sr", "sc")})`,
          minimal: "enqueue source",
        });

      case "bfs.loop":
        return pickMode(mode, {
          explain:
            qSize !== undefined
              ? `Queue has ${qSize} element${qSize !== 1 ? "s" : ""} \u2014 not empty.`
              : "Queue is not empty \u2014 continue loop.",
          code: "while queue is not empty",
          minimal: `queue: ${qSize ?? "?"}`,
        });

      case "bfs.dequeue":
        return pickMode(mode, {
          explain:
            lv !== undefined
              ? `Dequeue ${coord(meta, "r", "c")} from front (level ${lv}).`
              : `Dequeue ${coord(meta, "r", "c")} from front.`,
          code: `(r, c) = queue.dequeue()`,
          minimal: `dequeue ${coord(meta, "r", "c")}`,
        });

      case "bfs.check":
        return pickMode(mode, {
          explain:
            dir
              ? `Compute neighbor ${coord(meta, "nr", "nc")} \u2014 ${dir} of ${coord(meta, "r", "c")}.`
              : `Compute neighbor ${coord(meta, "nr", "nc")}.`,
          code: `nr, nc = r + dr, c + dc`,
          minimal: `check ${dir ?? "neighbor"}`,
        });

      case "bfs.oob":
        return pass
          ? pickMode(mode, {
              explain: `${coord(meta, "nr", "nc")} is in bounds \u2014 continue checking.`,
              code: "in bounds \u2192 next check",
              minimal: "in bounds",
            })
          : pickMode(mode, {
              explain:
                dir
                  ? `${coord(meta, "nr", "nc")} is out of bounds (${dir}) \u2014 skip.`
                  : `${coord(meta, "nr", "nc")} is out of bounds \u2014 skip.`,
              code: "out of bounds \u2192 continue",
              minimal: "oob skip",
            });

      case "bfs.wall":
        return pass
          ? pickMode(mode, {
              explain: `${coord(meta, "nr", "nc")} is not a wall \u2014 continue checking.`,
              code: "not wall \u2192 next check",
              minimal: "not wall",
            })
          : pickMode(mode, {
              explain:
                dir
                  ? `${coord(meta, "nr", "nc")} is a wall (${dir}) \u2014 skip.`
                  : `${coord(meta, "nr", "nc")} is a wall \u2014 skip.`,
              code: "wall \u2192 continue",
              minimal: "wall skip",
            });

      case "bfs.visited":
        return pass
          ? pickMode(mode, {
              explain: `${coord(meta, "nr", "nc")} not yet visited \u2014 discover it.`,
              code: "not visited \u2192 proceed",
              minimal: "unvisited",
            })
          : pickMode(mode, {
              explain:
                dir
                  ? `${coord(meta, "nr", "nc")} already visited (${dir}) \u2014 skip.`
                  : `${coord(meta, "nr", "nc")} already visited \u2014 skip.`,
              code: "visited \u2192 continue",
              minimal: "visited skip",
            });

      case "bfs.mark":
        return pickMode(mode, {
          explain: `Mark ${coord(meta, "nr", "nc")} as visited.`,
          code: `visited[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = true`,
          minimal: `mark ${coord(meta, "nr", "nc")}`,
        });

      case "bfs.setlevel":
        return pickMode(mode, {
          explain:
            lv !== undefined
              ? `Set level of ${coord(meta, "nr", "nc")} to ${lv}.`
              : `Set level of ${coord(meta, "nr", "nc")}.`,
          code: `level[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = ${lv ?? "?"}`,
          minimal: `level ${lv ?? "?"}`,
        });

      case "bfs.enqueue":
        return pickMode(mode, {
          explain: `Enqueue ${coord(meta, "nr", "nc")}.`,
          code: `queue.enqueue(${coord(meta, "nr", "nc")})`,
          minimal: `enqueue ${coord(meta, "nr", "nc")}`,
        });

      case "bfs.done":
        return pickMode(mode, {
          explain:
            totalVisited !== undefined
              ? `Queue empty \u2014 BFS complete. ${totalVisited} cells visited.`
              : "Queue empty \u2014 BFS complete.",
          code: "return level",
          minimal: "done",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing BFS narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default BFS_NARRATION;
