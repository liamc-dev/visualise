// src/generators/algorithms/sorting/radix-sort/radix-sort.narration.ts
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

const DIGIT_NAMES: Record<number, string> = {
  1: "ones",
  10: "tens",
  100: "hundreds",
  1000: "thousands",
  10000: "ten-thousands",
};

function digitName(exp: number): string {
  return DIGIT_NAMES[exp] ?? `10^${Math.log10(exp)}`;
}

export const RADIX_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("RadixSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const exp = n(meta, "exp");
    const i = n(meta, "i");
    const digit = n(meta, "digit");
    const value = n(meta, "value");
    const pos = n(meta, "pos");
    const countVal = n(meta, "countVal");
    const prefixIdx = n(meta, "prefixIdx");
    const passLabel = exp !== undefined ? digitName(exp) : "?";

    switch (token) {
      case "rx.init":
        return pickMode(mode, {
          explain: "Start radix sort (LSD, base 10). Process digits from least to most significant.",
          code: "radixSort(a);",
          minimal: "start",
        });

      case "rx.digit_start":
        return pickMode(mode, {
          explain: `Processing the ${passLabel} digit (exp=${exp}).`,
          code: `for exp = ${exp}`,
          minimal: `digit ${passLabel}`,
        });

      case "rx.extract":
        return pickMode(mode, {
          explain:
            typeof value === "number" && typeof digit === "number"
              ? `Element a[${i}]=${value} has ${passLabel} digit ${digit}.`
              : `Extract the ${passLabel} digit.`,
          code: `digit = (a[${i}] / ${exp}) % 10`,
          minimal: `d=${digit}`,
        });

      case "rx.count":
        return pickMode(mode, {
          explain:
            typeof digit === "number" && typeof countVal === "number"
              ? `Increment count[${digit}] to ${countVal}.`
              : `Increment count for digit ${digit}.`,
          code: `count[${digit}]++`,
          minimal: `count[${digit}]`,
        });

      case "rx.prefix":
        return pickMode(mode, {
          explain:
            typeof prefixIdx === "number" && typeof countVal === "number"
              ? `Prefix sum: count[${prefixIdx}] = ${countVal}.`
              : "Build prefix sums from counts.",
          code: `count[${prefixIdx}] += count[${prefixIdx !== undefined ? prefixIdx - 1 : "?"}]`,
          minimal: "prefix",
        });

      case "rx.place":
        return pickMode(mode, {
          explain:
            typeof value === "number" && typeof pos === "number"
              ? `Place ${value} at output[${pos}] (count[${digit}] was ${typeof countVal === "number" ? countVal + 1 : "?"}).`
              : "Place element into output using count.",
          code: `output[--count[${digit}]] = a[${i}]`,
          minimal: "place",
        });

      case "rx.copy_back":
        return pickMode(mode, {
          explain: `Copy output back to input array for next pass.`,
          code: "a = copy(output)",
          minimal: "copy",
        });

      case "rx.pass_done":
        return pickMode(mode, {
          explain: `${passLabel} digit pass complete.`,
          code: `// end exp=${exp}`,
          minimal: "pass done",
        });

      case "rx.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return a;",
          minimal: "sorted",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing radix-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default RADIX_SORT_NARRATION;
