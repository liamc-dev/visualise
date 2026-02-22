// src/generators/algorithms/sorting/counting-sort/counting-sort.narration.ts
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

export const COUNTING_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("CountingSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const i = n(meta, "i");
    const value = n(meta, "value");
    const pos = n(meta, "pos");
    const countVal = n(meta, "countVal");
    const prefixIdx = n(meta, "prefixIdx");
    const k = n(meta, "k");

    switch (token) {
      case "cs.init":
        return pickMode(mode, {
          explain: `Start counting sort. Max value is ${n(meta, "maxVal") ?? "?"}, so count array has ${k ?? "?"} slots (0..${(k ?? 1) - 1}).`,
          code: "countingSort(a);",
          minimal: "start",
        });

      case "cs.count_init":
        return pickMode(mode, {
          explain: `Initialize count array of size ${k ?? "?"} with all zeros.`,
          code: `count = [0] * ${k ?? "k"}`,
          minimal: "init count",
        });

      case "cs.scan":
        return pickMode(mode, {
          explain:
            typeof value === "number"
              ? `Look at a[${i}] = ${value}.`
              : "Scan next input element.",
          code: `// a[${i}] = ${value}`,
          minimal: `a[${i}]`,
        });

      case "cs.count":
        return pickMode(mode, {
          explain:
            typeof value === "number" && typeof countVal === "number"
              ? `Increment count[${value}] to ${countVal}.`
              : "Increment count for this value.",
          code: `count[${value}]++`,
          minimal: `count[${value}]`,
        });

      case "cs.prefix_read": {
        const prevVal = n(meta, "prevVal");
        const curVal = n(meta, "curVal");
        return pickMode(mode, {
          explain:
            typeof prefixIdx === "number"
              ? `Prefix sum: count[${prefixIdx - 1}] = ${prevVal ?? "?"} and count[${prefixIdx}] = ${curVal ?? "?"}.`
              : "Read adjacent count cells for prefix sum.",
          code: `// count[${prefixIdx !== undefined ? prefixIdx - 1 : "?"}]=${prevVal}, count[${prefixIdx}]=${curVal}`,
          minimal: `[${prefixIdx !== undefined ? prefixIdx - 1 : "?"}]+[${prefixIdx}]`,
        });
      }

      case "cs.prefix":
        return pickMode(mode, {
          explain:
            typeof prefixIdx === "number" && typeof countVal === "number"
              ? `count[${prefixIdx}] += count[${prefixIdx - 1}] → ${countVal}.`
              : "Add previous count to current.",
          code: `count[${prefixIdx}] += count[${prefixIdx !== undefined ? prefixIdx - 1 : "?"}]`,
          minimal: `=${countVal}`,
        });

      case "cs.read":
        return pickMode(mode, {
          explain:
            typeof value === "number" && typeof pos === "number"
              ? `Read a[${i}] = ${value}. count[${value}] = ${typeof countVal === "number" ? countVal : "?"}, so it goes to output[${pos}].`
              : "Look up position from count array.",
          code: `// a[${i}]=${value}, pos=${pos}`,
          minimal: `pos=${pos}`,
        });

      case "cs.place":
        return pickMode(mode, {
          explain:
            typeof value === "number" && typeof pos === "number"
              ? `Place ${value} into output[${pos}], decrement count[${value}].`
              : "Place element into output using count.",
          code: `output[--count[${value}]] = a[${i}]`,
          minimal: "place",
        });

      case "cs.copy_back":
        return pickMode(mode, {
          explain: "Copy output back to input array.",
          code: "a = copy(output)",
          minimal: "copy",
        });

      case "cs.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return a;",
          minimal: "sorted",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing counting-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default COUNTING_SORT_NARRATION;
