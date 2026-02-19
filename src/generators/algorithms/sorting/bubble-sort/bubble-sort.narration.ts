import type { NarrationBundle, NarrationMode } from "../../../../types/algo-types";

function pickMode(
  mode: NarrationMode,
  m: { explain: string; code: string; minimal: string }
) {
  return m[mode] ?? m.explain;
}

type Meta = Record<string, unknown>;

function n(meta: Meta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === "number" ? v : undefined;
}
function b(meta: Meta, key: string): boolean | undefined {
  const v = meta[key];
  return typeof v === "boolean" ? v : undefined;
}

export const BUBBLE_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("BubbleSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const j = n(meta, "j");
    const valJ = n(meta, "valJ");
    const valJ1 = n(meta, "valJ1");
    const pass = n(meta, "pass");
    const swapped = b(meta, "swapped");
    const sortedIndex = n(meta, "sortedIndex");
    const value = n(meta, "value");

    switch (token) {
      case "bs.init":
        return pickMode(mode, {
          explain:
            "Start Bubble Sort: repeatedly walk the array, swapping adjacent elements that are out of order.",
          code: "bubbleSort(a);",
          minimal: "start",
        });

      case "bs.pass_start":
        return pickMode(mode, {
          explain:
            typeof pass === "number"
              ? `Begin pass ${pass}: scan left-to-right, bubbling the largest unsorted value to the end.`
              : "Begin a new pass over the unsorted portion.",
          code: `for (i = ${pass ?? "?"}) ...`,
          minimal: `pass ${pass ?? "?"}`,
        });

      case "bs.compare":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof valJ1 === "number" &&
            typeof j === "number"
              ? `Compare a[${j}]=${valJ} with a[${j + 1}]=${valJ1}.`
              : "Compare adjacent elements.",
          code: "if (a[j] > a[j + 1]) ...",
          minimal: "cmp",
        });

      case "bs.swap":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof valJ1 === "number" &&
            typeof j === "number"
              ? `${valJ} > ${valJ1} → swap a[${j}] and a[${j + 1}].`
              : "Out of order → swap.",
          code: "swap(a[j], a[j + 1]);",
          minimal: "swap",
        });

      case "bs.no_swap":
        return pickMode(mode, {
          explain:
            typeof valJ === "number" &&
            typeof valJ1 === "number" &&
            typeof j === "number"
              ? `${valJ} ≤ ${valJ1} → already in order, no swap needed.`
              : "Already in order → skip.",
          code: "// no swap",
          minimal: "skip",
        });

      case "bs.pass_done":
        return pickMode(mode, {
          explain:
            typeof sortedIndex === "number" && typeof value === "number"
              ? `Pass complete: ${value} is now fixed at index ${sortedIndex}.`
              : "Pass complete: rightmost unsorted element is now in place.",
          code: "// a[n-i-1] settled",
          minimal: "pass done",
        });

      case "bs.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return a;",
          minimal: "sorted",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing bubble-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default BUBBLE_SORT_NARRATION;
