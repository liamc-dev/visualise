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

export const DFS_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("DFS narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const stackSize = n(meta, "stackSize");
    const order = n(meta, "order");
    const dir = s(meta, "dir");
    const totalVisited = n(meta, "totalVisited");
    const pass = s(meta, "result") === "pass";

    switch (token) {
      case "dfs.init.stack":
        return pickMode(mode, {
          explain: "Create an empty stack for DFS exploration.",
          code: "stack = []",
          minimal: "create stack",
        });

      case "dfs.init.visited":
        return pickMode(mode, {
          explain: "Initialize all cells as unvisited.",
          code: "visited = [[false] ...]",
          minimal: "init visited",
        });

      case "dfs.init.order":
        return pickMode(mode, {
          explain: "Initialize all discovery orders to \u22121 (unreached).",
          code: "order = [[-1] ...]",
          minimal: "init order",
        });

      case "dfs.init.mark":
        return pickMode(mode, {
          explain: `Mark ${coord(meta, "sr", "sc")} as visited.`,
          code: `visited[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = true`,
          minimal: "mark source",
        });

      case "dfs.init.setorder":
        return pickMode(mode, {
          explain: `Set discovery order of ${coord(meta, "sr", "sc")} to 1.`,
          code: `order[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = 1`,
          minimal: "source order 1",
        });

      case "dfs.init.push":
        return pickMode(mode, {
          explain: `Push source cell ${coord(meta, "sr", "sc")} onto the stack.`,
          code: `stack.push(${coord(meta, "sr", "sc")})`,
          minimal: "push source",
        });

      case "dfs.loop":
        return pickMode(mode, {
          explain:
            stackSize !== undefined
              ? `Stack has ${stackSize} element${stackSize !== 1 ? "s" : ""} \u2014 not empty.`
              : "Stack is not empty \u2014 continue loop.",
          code: "while stack is not empty",
          minimal: `stack: ${stackSize ?? "?"}`,
        });

      case "dfs.pop":
        return pickMode(mode, {
          explain:
            order !== undefined
              ? `Pop ${coord(meta, "r", "c")} from top (order ${order}).`
              : `Pop ${coord(meta, "r", "c")} from top.`,
          code: `(r, c) = stack.pop()`,
          minimal: `pop ${coord(meta, "r", "c")}`,
        });

      case "dfs.check":
        return pickMode(mode, {
          explain:
            dir
              ? `Compute neighbor ${coord(meta, "nr", "nc")} \u2014 ${dir} of ${coord(meta, "r", "c")}.`
              : `Compute neighbor ${coord(meta, "nr", "nc")}.`,
          code: `nr, nc = r + dr, c + dc`,
          minimal: `check ${dir ?? "neighbor"}`,
        });

      case "dfs.oob":
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

      case "dfs.wall":
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

      case "dfs.visited":
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

      case "dfs.mark":
        return pickMode(mode, {
          explain: `Mark ${coord(meta, "nr", "nc")} as visited.`,
          code: `visited[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = true`,
          minimal: `mark ${coord(meta, "nr", "nc")}`,
        });

      case "dfs.setorder":
        return pickMode(mode, {
          explain:
            order !== undefined
              ? `Set discovery order of ${coord(meta, "nr", "nc")} to ${order}.`
              : `Set discovery order of ${coord(meta, "nr", "nc")}.`,
          code: `order[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = ${order ?? "?"}`,
          minimal: `order ${order ?? "?"}`,
        });

      case "dfs.push":
        return pickMode(mode, {
          explain: `Push ${coord(meta, "nr", "nc")} onto the stack.`,
          code: `stack.push(${coord(meta, "nr", "nc")})`,
          minimal: `push ${coord(meta, "nr", "nc")}`,
        });

      case "dfs.done":
        return pickMode(mode, {
          explain:
            totalVisited !== undefined
              ? `DFS complete \u2014 ${totalVisited} cells reached. Each cell shows its discovery order.`
              : "DFS complete. Each cell shows its discovery order.",
          code: "return order",
          minimal: `done \u2014 ${totalVisited ?? "?"} reached`,
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing DFS narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default DFS_NARRATION;
