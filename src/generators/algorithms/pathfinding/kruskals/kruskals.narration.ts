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

export const KRUSKALS_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("Kruskal's narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const rootU = s(meta, "rootU");
    const rootV = s(meta, "rootV");
    const edgeCount = n(meta, "edgeCount");
    const totalWeight = n(meta, "totalWeight");

    switch (token) {
      case "kruskal.sort":
        return pickMode(mode, {
          explain:
            `Sort all ${n(meta, "edgeCount") ?? "?"} edges by weight \u2014 process cheapest first.`,
          code: "edges.sort(by weight)",
          minimal: "sort edges",
        });

      case "kruskal.dsu":
        return pickMode(mode, {
          explain: "Initialize union-find: each node is its own parent (separate components).",
          code: "parent = {v: v}",
          minimal: "init DSU",
        });

      case "kruskal.mst":
        return pickMode(mode, {
          explain: "Create empty MST edge list.",
          code: "mst = []",
          minimal: "init mst",
        });

      case "kruskal.loop":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Consider edge ${u}\u2013${v} with weight ${w}.`
              : "Consider next edge in sorted order.",
          code: `for (u, v, w) in edges // ${u ?? "?"}-${v ?? "?"}, w=${w ?? "?"}`,
          minimal: `edge ${u ?? "?"}-${v ?? "?"}`,
        });

      case "kruskal.find":
        return pickMode(mode, {
          explain:
            u !== undefined && rootU !== undefined
              ? `Find root of ${u} \u2192 ${rootU}.`
              : "Find root of u.",
          code: `rootU = find(${u ?? "?"}) // ${rootU ?? "?"}`,
          minimal: `find(${u ?? "?"})`,
        });

      case "kruskal.find2":
        return pickMode(mode, {
          explain:
            v !== undefined && rootV !== undefined
              ? `Find root of ${v} \u2192 ${rootV}.`
              : "Find root of v.",
          code: `rootV = find(${v ?? "?"}) // ${rootV ?? "?"}`,
          minimal: `find(${v ?? "?"})`,
        });

      case "kruskal.find.check": {
        const node = s(meta, "node");
        const parentNode = s(meta, "parentNode");
        const isRoot = meta.isRoot === true;
        if (isRoot) {
          return pickMode(mode, {
            explain:
              node !== undefined
                ? `parent[${node}] = ${node} \u2014 root found.`
                : "Root found.",
            code: `while parent[${node ?? "?"}] != ${node ?? "?"} // false`,
            minimal: `root=${node ?? "?"}`,
          });
        }
        return pickMode(mode, {
          explain:
            node !== undefined && parentNode !== undefined
              ? `parent[${node}] = ${parentNode} \u2260 ${node} \u2014 keep walking.`
              : "Not at root, keep walking.",
          code: `while parent[${node ?? "?"}] != ${node ?? "?"} // true`,
          minimal: `${node ?? "?"}\u2260root`,
        });
      }

      case "kruskal.find.up": {
        const node = s(meta, "node");
        const newNode = s(meta, "newNode");
        return pickMode(mode, {
          explain:
            node !== undefined && newNode !== undefined
              ? `Follow parent: ${node} \u2192 ${newNode}.`
              : "Follow parent pointer up.",
          code: `x = parent[${node ?? "?"}] // ${newNode ?? "?"}`,
          minimal: `${node ?? "?"}\u2192${newNode ?? "?"}`,
        });
      }

      case "kruskal.check": {
        const same = meta.same === true;
        return pickMode(mode, {
          explain:
            rootU !== undefined && rootV !== undefined
              ? same
                ? `rootU = ${rootU}, rootV = ${rootV} \u2014 same component!`
                : `rootU = ${rootU}, rootV = ${rootV} \u2014 different components.`
              : "Check if u and v share a root.",
          code: `if rootU != rootV // ${rootU ?? "?"} vs ${rootV ?? "?"}`,
          minimal: same ? "same" : "diff",
        });
      }

      case "kruskal.add":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Add edge ${u}\u2013${v} (weight ${w}) to MST.`
              : "Add edge to MST.",
          code: `mst.push(${u ?? "?"}-${v ?? "?"})`,
          minimal: `+${u ?? "?"}-${v ?? "?"}`,
        });

      case "kruskal.union":
        return pickMode(mode, {
          explain:
            rootU !== undefined && rootV !== undefined
              ? `Union: set parent[${rootU}] = ${rootV} \u2014 merge components.`
              : "Union the two components.",
          code: `parent[${rootU ?? "?"}] = ${rootV ?? "?"}`,
          minimal: `union`,
        });

      case "kruskal.skip":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined
              ? `Skip edge ${u}\u2013${v} \u2014 same component, would create cycle.`
              : "Skip \u2014 same component.",
          code: "// skip (cycle)",
          minimal: "skip",
        });

      case "kruskal.done":
        return pickMode(mode, {
          explain:
            totalWeight !== undefined && edgeCount !== undefined
              ? `MST complete \u2014 ${edgeCount} edges, total weight ${totalWeight}.`
              : "Kruskal's complete \u2014 minimum spanning tree found.",
          code: "return mst",
          minimal: "done",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing kruskal's narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default KRUSKALS_NARRATION;
