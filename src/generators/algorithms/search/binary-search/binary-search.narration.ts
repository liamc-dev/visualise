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

export const BINARY_SEARCH_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if (import.meta.env.DEV) {
        throw new Error("BinarySearch narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const lo = n(meta, "lo");
    const hi = n(meta, "hi");
    const mid = n(meta, "mid");
    const midVal = n(meta, "midVal");
    const target = n(meta, "target");
    const newLo = n(meta, "newLo");
    const newHi = n(meta, "newHi");
    const cmp = s(meta, "cmp");

    switch (token) {
      case "bin.init":
        return pickMode(mode, {
          explain:
            `Start Binary Search: find ${target ?? "?"} in a sorted array of ${n(meta, "n") ?? "?"} elements.`,
          code: "binarySearch(a, target);",
          minimal: "start",
        });

      case "bin.loop":
        return pickMode(mode, {
          explain:
            typeof lo === "number" && typeof hi === "number"
              ? `lo=${lo} <= hi=${hi}, search space is not empty — continue.`
              : "Check if search space is non-empty.",
          code: "while (lo <= hi) ...",
          minimal: "loop check",
        });

      case "bin.mid":
        return pickMode(mode, {
          explain:
            typeof lo === "number" && typeof hi === "number" && typeof mid === "number"
              ? `Calculate mid = floor((${lo}+${hi})/2) = ${mid}, a[${mid}] = ${midVal ?? "?"}.`
              : "Calculate the midpoint.",
          code: `mid = (lo + hi) / 2; // ${mid ?? "?"}`,
          minimal: `mid=${mid ?? "?"}`,
        });

      case "bin.compare":
        if (cmp === "eq") {
          return pickMode(mode, {
            explain:
              `a[${mid ?? "?"}] = ${midVal ?? "?"} equals target ${target ?? "?"} — found!`,
            code: `a[mid] == target // ${midVal} == ${target}`,
            minimal: "match!",
          });
        }
        if (cmp === "lt") {
          return pickMode(mode, {
            explain:
              `a[${mid ?? "?"}] = ${midVal ?? "?"} < ${target ?? "?"} — target is in the right half.`,
            code: `a[mid] < target // ${midVal} < ${target}`,
            minimal: "go right",
          });
        }
        return pickMode(mode, {
          explain:
            `a[${mid ?? "?"}] = ${midVal ?? "?"} > ${target ?? "?"} — target is in the left half.`,
          code: `a[mid] > target // ${midVal} > ${target}`,
          minimal: "go left",
        });

      case "bin.go_right":
        return pickMode(mode, {
          explain:
            `Target is larger — move lo to mid+1 = ${newLo ?? "?"}, discard left half.`,
          code: `lo = mid + 1; // ${newLo ?? "?"}`,
          minimal: `lo=${newLo ?? "?"}`,
        });

      case "bin.go_left":
        return pickMode(mode, {
          explain:
            `Target is smaller — move hi to mid-1 = ${newHi ?? "?"}, discard right half.`,
          code: `hi = mid - 1; // ${newHi ?? "?"}`,
          minimal: `hi=${newHi ?? "?"}`,
        });

      case "bin.found":
        return pickMode(mode, {
          explain:
            `Found ${target ?? "?"} at index ${mid ?? "?"}.`,
          code: `return mid; // ${mid ?? "?"}`,
          minimal: "found",
        });

      case "bin.not_found":
        return pickMode(mode, {
          explain:
            `Search space exhausted — ${target ?? "?"} is not in the array.`,
          code: "return -1;",
          minimal: "not found",
        });

      default: {
        if (import.meta.env.DEV) {
          throw new Error(`Missing binary-search narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default BINARY_SEARCH_NARRATION;
