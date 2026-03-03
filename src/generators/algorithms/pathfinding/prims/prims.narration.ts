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

export const PRIMS_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("Prim's narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const source = s(meta, "source");
    const u = s(meta, "u");
    const v = s(meta, "v");
    const w = n(meta, "w");
    const unvisitedCount = n(meta, "unvisitedCount");
    const keyU = n(meta, "keyU");
    const currentKey = meta.currentKey;
    const oldKey = meta.oldKey;
    const newKey = n(meta, "newKey");
    const totalWeight = n(meta, "totalWeight");

    switch (token) {
      case "prim.init.key":
        return pickMode(mode, {
          explain:
            `Initialize key[] to \u221e for all ${n(meta, "V") ?? "?"} nodes. Source is ${source ?? "?"}.`,
          code: "key = {\u221e}",
          minimal: "init key",
        });

      case "prim.init.parent":
        return pickMode(mode, {
          explain: "Initialize parent[] to null \u2014 no MST edges yet.",
          code: "parent = {null}",
          minimal: "init parent",
        });

      case "prim.init.mst":
        return pickMode(mode, {
          explain: "Create empty set to track nodes added to the MST.",
          code: "inMST = {}",
          minimal: "init inMST",
        });

      case "prim.source":
        return pickMode(mode, {
          explain:
            `Set key[${source ?? "?"}] = 0 \u2014 source enters MST first.`,
          code: "key[src] = 0",
          minimal: `key[${source ?? "?"}]=0`,
        });

      case "prim.loop":
        return pickMode(mode, {
          explain:
            `${unvisitedCount ?? "?"} nodes remaining \u2014 pick the cheapest.`,
          code: "while |inMST| < V",
          minimal: `${unvisitedCount ?? "?"} left`,
        });

      case "prim.pick.scan":
        return pickMode(mode, {
          explain: "Scan all unvisited nodes to find the one with the smallest key.",
          code: "for i in range(V)",
          minimal: "scan",
        });

      case "prim.pick.check": {
        const candidate = s(meta, "candidate");
        const keyVal = meta.keyVal;
        const best = meta.best;
        const inMst = meta.inMST === true;
        const keyStr = keyVal === Infinity ? "\u221e" : keyVal;
        const bestStr = best === Infinity ? "\u221e" : best;
        if (inMst) {
          return pickMode(mode, {
            explain: `${candidate ?? "?"} is already in MST \u2014 skip.`,
            code: `// ${candidate ?? "?"} in inMST`,
            minimal: `${candidate ?? "?"} skip`,
          });
        }
        return pickMode(mode, {
          explain:
            `Check ${candidate ?? "?"}: key = ${keyStr}, best so far = ${bestStr}.`,
          code: `if key[${candidate ?? "?"}] < best`,
          minimal: `${candidate ?? "?"}:${keyStr}`,
        });
      }

      case "prim.pick.best": {
        const candidate = s(meta, "candidate");
        const keyVal = meta.keyVal;
        return pickMode(mode, {
          explain:
            `${candidate ?? "?"} has key ${keyVal ?? "?"} \u2014 new minimum candidate.`,
          code: `u = ${candidate ?? "?"}, best = ${keyVal ?? "?"}`,
          minimal: `best\u2192${candidate ?? "?"}`,
        });
      }

      case "prim.pick":
        return pickMode(mode, {
          explain:
            u !== undefined && keyU !== undefined
              ? `Pick ${u} with key ${keyU} \u2014 minimum among unvisited.`
              : "Pick min-key unvisited node.",
          code: `u = minKey() // ${u ?? "?"}`,
          minimal: `pick ${u ?? "?"}`,
        });

      case "prim.add":
        return pickMode(mode, {
          explain:
            u !== undefined
              ? `Add ${u} to MST${s(meta, "parentU") ? ` via edge from ${s(meta, "parentU")}` : ""}.`
              : "Add node to MST.",
          code: `inMST.add(${u ?? "?"})`,
          minimal: `+${u ?? "?"}`,
        });

      case "prim.neighbors":
        return pickMode(mode, {
          explain:
            u !== undefined && v !== undefined && w !== undefined
              ? `Examine neighbor ${v} of ${u} with edge weight ${w}.`
              : "Examine next neighbor.",
          code: `for (v, w) in adj[${u ?? "?"}] // ${v ?? "?"}, w=${w ?? "?"}`,
          minimal: `nb ${v ?? "?"}`,
        });

      case "prim.check": {
        const result = s(meta, "result");
        return pickMode(mode, {
          explain:
            v !== undefined
              ? result === "fail"
                ? `${v} is already in MST \u2014 skip.`
                : `${v} is not in MST \u2014 check if edge is cheaper.`
              : "Check if neighbor is in MST.",
          code: `if ${v ?? "?"} not in inMST // ${result ?? "?"}`,
          minimal: result === "fail" ? "in MST" : "not in MST",
        });
      }

      case "prim.relax": {
        const curKey = currentKey === Infinity ? "\u221e" : currentKey;
        const improved = typeof w === "number" && typeof currentKey === "number"
          ? w < currentKey
          : typeof w === "number" && currentKey === Infinity;
        return pickMode(mode, {
          explain:
            v !== undefined && w !== undefined
              ? `Edge weight ${w} vs key[${v}] = ${curKey}. ${improved ? `${w} < ${curKey} \u2014 cheaper!` : "No improvement."}`
              : "Compare edge weight with current key.",
          code: `if ${w ?? "?"} < key[${v ?? "?"}]`,
          minimal: `w=${w ?? "?"} vs ${curKey}`,
        });
      }

      case "prim.skip":
        return pickMode(mode, {
          explain:
            v !== undefined && currentKey !== undefined && w !== undefined
              ? `No improvement for ${v} (key ${currentKey} \u2264 weight ${w}).`
              : "No improvement for this neighbor.",
          code: "// no update",
          minimal: "skip",
        });

      case "prim.update.key":
        return pickMode(mode, {
          explain:
            v !== undefined && oldKey !== undefined && newKey !== undefined
              ? `Cheaper edge! Update key[${v}]: ${oldKey} \u2192 ${newKey}.`
              : "Update key with cheaper weight.",
          code: `key[${v ?? "?"}] = ${newKey ?? "?"}`,
          minimal: `key[${v ?? "?"}]=${newKey ?? "?"}`,
        });

      case "prim.update.parent":
        return pickMode(mode, {
          explain:
            v !== undefined && u !== undefined
              ? `Set parent[${v}] = ${u} \u2014 ${v} connects to MST via ${u}.`
              : "Update parent pointer.",
          code: `parent[${v ?? "?"}] = ${u ?? "?"}`,
          minimal: `par[${v ?? "?"}]=${u ?? "?"}`,
        });

      case "prim.done":
        return pickMode(mode, {
          explain:
            totalWeight !== undefined
              ? `MST complete \u2014 total weight ${totalWeight}.`
              : "Prim's complete \u2014 minimum spanning tree found.",
          code: "return key, parent",
          minimal: "done",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing prim's narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default PRIMS_NARRATION;
