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

export const LINEAR_SEARCH_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("LinearSearch narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const i = n(meta, "i");
    const value = n(meta, "value");
    const target = n(meta, "target");

    switch (token) {
      case "lin.init":
        return pickMode(mode, {
          explain:
            `Start Linear Search: find ${target ?? "?"} in an array of ${n(meta, "n") ?? "?"} elements.`,
          code: "linearSearch(a, target);",
          minimal: "start",
        });

      case "lin.check":
        return pickMode(mode, {
          explain:
            typeof i === "number" && typeof value === "number" && typeof target === "number"
              ? value === target
                ? `a[${i}] = ${value} equals target ${target} — found!`
                : `a[${i}] = ${value}, not equal to ${target}.`
              : "Check current element.",
          code: `a[${i ?? "?"}] == ${target ?? "?"} ? // ${value ?? "?"}`,
          minimal: `check [${i ?? "?"}]`,
        });

      case "lin.next":
        return pickMode(mode, {
          explain:
            `No match at index ${i ?? "?"} — move to next element.`,
          code: `i++ // ${typeof i === "number" ? i + 1 : "?"}`,
          minimal: "next",
        });

      case "lin.found":
        return pickMode(mode, {
          explain:
            `Found ${target ?? "?"} at index ${i ?? "?"}.`,
          code: `return ${i ?? "?"}; // found`,
          minimal: "found",
        });

      case "lin.not_found":
        return pickMode(mode, {
          explain:
            `Scanned entire array — ${target ?? "?"} is not present.`,
          code: "return -1;",
          minimal: "not found",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing linear-search narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default LINEAR_SEARCH_NARRATION;
