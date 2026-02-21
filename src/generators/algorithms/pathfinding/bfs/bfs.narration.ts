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

function queueStr(meta: Meta): string {
  const q = meta.queue;
  if (Array.isArray(q)) return `[${q.join(", ")}]`;
  return "[]";
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

    const u = s(meta, "u");
    const v = s(meta, "v");
    const lv = n(meta, "level");

    switch (token) {
      case "bfs.init":
        return pickMode(mode, {
          explain: `Start BFS from ${s(meta, "source") ?? "A"}. Queue: ${queueStr(meta)}.`,
          code: "queue = [src]; visited[src] = true",
          minimal: "init",
        });

      case "bfs.dequeue":
        return pickMode(mode, {
          explain:
            u !== undefined && lv !== undefined
              ? `Dequeue ${u} (level ${lv}). Queue: ${queueStr(meta)}.`
              : "Dequeue next node from queue.",
          code: "u = queue.shift()",
          minimal: `dequeue ${u ?? "?"}`,
        });

      case "bfs.explore":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined
              ? `Explore edge ${u}\u2192${v}.`
              : "Explore edge to neighbor.",
          code: "for v of adj[u]",
          minimal: `${u ?? "?"}\u2192${v ?? "?"}`,
        });

      case "bfs.discover":
        return pickMode(mode, {
          explain:
            v !== undefined && lv !== undefined
              ? `Discover ${v} (level ${lv}). Enqueue.`
              : "Discover neighbor. Enqueue.",
          code: "queue.push(v)",
          minimal: `discover ${v ?? "?"}`,
        });

      case "bfs.skip":
        return pickMode(mode, {
          explain:
            v !== undefined
              ? `${v} already discovered. Skip.`
              : "Already discovered. Skip.",
          code: "// visited",
          minimal: "skip",
        });

      case "bfs.done":
        return pickMode(mode, {
          explain: "BFS complete. All reachable nodes visited.",
          code: "return",
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
