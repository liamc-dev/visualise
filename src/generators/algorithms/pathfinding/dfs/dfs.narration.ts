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

/** Returns node label for graph mode, or grid coord for grid mode. */
function target(meta: Meta, nodeKey: string, rKey: string, cKey: string): string {
  const v = s(meta, nodeKey);
  return v ?? coord(meta, rKey, cKey);
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

      case "dfs.init.mark": {
        const src = target(meta, "source", "sr", "sc");
        return pickMode(mode, {
          explain: `Mark ${src} as visited.`,
          code: s(meta, "source") ? `visited.add(${src})` : `visited[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = true`,
          minimal: "mark source",
        });
      }

      case "dfs.init.setorder": {
        const src = target(meta, "source", "sr", "sc");
        return pickMode(mode, {
          explain: `Set discovery order of ${src} to 1.`,
          code: s(meta, "source") ? `order[${src}] = 1` : `order[${n(meta, "sr") ?? "sr"}][${n(meta, "sc") ?? "sc"}] = 1`,
          minimal: "source order 1",
        });
      }

      case "dfs.init.push": {
        const src = target(meta, "source", "sr", "sc");
        return pickMode(mode, {
          explain: `Push source ${s(meta, "source") ? "node" : "cell"} ${src} onto the stack.`,
          code: `stack.push(${src})`,
          minimal: "push source",
        });
      }

      case "dfs.loop":
        return pickMode(mode, {
          explain:
            stackSize !== undefined
              ? `Stack has ${stackSize} element${stackSize !== 1 ? "s" : ""} \u2014 not empty.`
              : "Stack is not empty \u2014 continue loop.",
          code: "while stack is not empty",
          minimal: `stack: ${stackSize ?? "?"}`,
        });

      case "dfs.pop": {
        const u = s(meta, "u");
        const label = u ?? coord(meta, "r", "c");
        return pickMode(mode, {
          explain: order !== undefined ? `Pop ${label} from top (order ${order}).` : `Pop ${label} from top.`,
          code: u ? `u = stack.pop() // ${u}` : `(r, c) = stack.pop()`,
          minimal: `pop ${label}`,
        });
      }

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

      case "dfs.neighbors": {
        const u = s(meta, "u");
        const v = s(meta, "v");
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined
              ? `Examine neighbor ${v} of ${u}.`
              : "Examine next neighbor.",
          code: `for v in adj[${u ?? "?"}] // ${v ?? "?"}`,
          minimal: `nb ${v ?? "?"}`,
        });
      }

      case "dfs.visited": {
        const u = s(meta, "u");
        const v = s(meta, "v");
        if (u !== undefined && v !== undefined) {
          return pass
            ? pickMode(mode, {
                explain: `${v} not yet visited \u2014 discover it.`,
                code: "not visited \u2192 proceed",
                minimal: "unvisited",
              })
            : pickMode(mode, {
                explain: `${v} already visited \u2014 skip.`,
                code: "visited \u2192 continue",
                minimal: "visited skip",
              });
        }
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
      }

      case "dfs.mark": {
        const nb = target(meta, "v", "nr", "nc");
        return pickMode(mode, {
          explain: `Mark ${nb} as visited.`,
          code: s(meta, "v") ? `visited.add(${nb})` : `visited[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = true`,
          minimal: `mark ${nb}`,
        });
      }

      case "dfs.setorder": {
        const nb = target(meta, "v", "nr", "nc");
        return pickMode(mode, {
          explain: order !== undefined ? `Set discovery order of ${nb} to ${order}.` : `Set discovery order of ${nb}.`,
          code: s(meta, "v") ? `order[${nb}] = ${order ?? "?"}` : `order[${n(meta, "nr") ?? "nr"}][${n(meta, "nc") ?? "nc"}] = ${order ?? "?"}`,
          minimal: `order ${order ?? "?"}`,
        });
      }

      case "dfs.push": {
        const nb = target(meta, "v", "nr", "nc");
        return pickMode(mode, {
          explain: `Push ${nb} onto the stack.`,
          code: `stack.push(${nb})`,
          minimal: `push ${nb}`,
        });
      }

      case "dfs.done":
        return pickMode(mode, {
          explain:
            totalVisited !== undefined
              ? `DFS complete \u2014 ${totalVisited} node${totalVisited !== 1 ? "s" : ""} reached. Each shows its discovery order.`
              : "DFS complete. Each node shows its discovery order.",
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
