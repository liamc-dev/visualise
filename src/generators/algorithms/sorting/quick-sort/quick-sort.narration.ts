// src/generators/algorithms/sorting/quick-sort/quick-sort.narration.ts
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
function s(meta: Meta, key: string): string | undefined {
  const v = meta[key];
  return typeof v === "string" ? v : undefined;
}

function fmtRange(lo?: number, hi?: number) {
  if (typeof lo === "number" && typeof hi === "number") return `${lo}–${hi}`;
  return "?–?";
}

export const QUICK_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("QuickSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    const lo = n(meta, "lo");
    const hi = n(meta, "hi");
    const range = fmtRange(lo, hi);

    const pivotIndex = n(meta, "pivotIndex");
    const pivotValue = n(meta, "pivotValue");

    const i = n(meta, "i");
    const j = n(meta, "j");
    const currentVal = n(meta, "currentVal");
    const relation = s(meta, "relation"); // "≤" | ">"
    const returnPivotIndex = n(meta, "returnPivotIndex");

    const side = s(meta, "side"); // "left" | "right"
    const from = s(meta, "from"); // "left" | "right"

    const alreadyInPlace = b(meta, "alreadyInPlace");

    const swapped = b(meta, "swapped");
    const kept = b(meta, "kept");

    const aIndex = n(meta, "aIndex");
    const bIndex = n(meta, "bIndex");
    const aValue = n(meta, "aValue");
    const bValue = n(meta, "bValue");

    const pivotFrom = n(meta, "pivotFrom");
    const pivotTo = n(meta, "pivotTo");
    const swappedWith = n(meta, "swappedWith");

    const recurseLo = n(meta, "recurseLo");
    const recurseHi = n(meta, "recurseHi");

    switch (token) {
      case "qs.init":
        return pickMode(mode, {
          explain:
            "Start Quick Sort: pick a pivot, partition values around it, then recurse on left and right segments.",
          code: "quickSort(a, 0, n - 1);",
          minimal: "start",
        });

      case "qs.base_return":
        return pickMode(mode, {
          explain: `Base case: range ${range} is size 0/1 → already sorted.`,
          code: "if (lo >= hi) return;",
          minimal: "base",
        });

      case "qs.partition_call":
        return pickMode(mode, {
          explain: `Partition range ${range}: move values ≤ pivot to the left side.`,
          code: "p = partition(a, lo, hi);",
          minimal: "partition",
        });

      case "qs.choose_pivot":
        return pickMode(mode, {
          explain:
            typeof pivotValue === "number" && typeof pivotIndex === "number"
              ? `Choose pivot ${pivotValue} at index ${pivotIndex} (end of range).`
              : "Choose the pivot (end of the segment).",
          code: "pivot = a[hi]; i = lo;",
          minimal: "pivot",
        });

      case "qs.compare":
        return pickMode(mode, {
          explain:
            typeof currentVal === "number" &&
            typeof pivotValue === "number" &&
            typeof j === "number"
              ? `Compare a[j=${j}]=${currentVal} ${relation ?? "?"} pivot ${pivotValue}.`
              : "Compare current value with the pivot.",
          code: "if (a[j] <= pivot) ...",
          minimal: "cmp",
        });

      case "qs.swap":
        return pickMode(mode, {
          explain:
            swapped &&
            typeof aValue === "number" &&
            typeof bValue === "number" &&
            typeof aIndex === "number" &&
            typeof bIndex === "number"
              ? `Swap a[${aIndex}]=${aValue} with a[${bIndex}]=${bValue} to grow the ≤ pivot region.`
              : "Swap to expand the ≤ pivot region.",
          code: "swap(a, i, j); i++;",
          minimal: "swap",
        });

      case "qs.keep_left":
        return pickMode(mode, {
          explain:
            kept && typeof currentVal === "number" && typeof j === "number"
              ? `a[j=${j}]=${currentVal} is already on the ≤ pivot side → keep it and advance boundary.`
              : "Already on the left side → keep it.",
          code: "i++; // (no swap needed)",
          minimal: "keep",
        });

      case "qs.pivot_place":
        return pickMode(mode, {
          explain:
            typeof pivotValue === "number" &&
            typeof pivotTo === "number" &&
            typeof pivotFrom === "number"
              ? `Place pivot ${pivotValue}: swap index ${pivotFrom} → ${pivotTo} (pivot's final position).`
              : "Swap pivot into its final position.",
          code: "swap(a, i, hi);",
          minimal: "pivot→pos",
        });

      case "qs.pivot_already":
        return pickMode(mode, {
          explain:
            alreadyInPlace && typeof pivotValue === "number" && typeof pivotIndex === "number"
              ? `Pivot ${pivotValue} is already in the correct spot at index ${pivotIndex}.`
              : "Pivot already in place.",
          code: "// pivot already at i",
          minimal: "pivot ok",
        });

      case "qs.partition_return":
        return pickMode(mode, {
          explain:
            typeof returnPivotIndex === "number"
              ? `Partition returns pivot index ${returnPivotIndex}.`
              : "Return pivot index.",
          code: "return i;",
          minimal: "ret p",
        });

      case "qs.partition_done":
        return pickMode(mode, {
          explain:
            typeof pivotValue === "number" && typeof pivotIndex === "number"
              ? `Partition complete: pivot ${pivotValue} is fixed at index ${pivotIndex}.`
              : "Partition complete: pivot is fixed in place.",
          code: "// pivot is in final position",
          minimal: "pivot fixed",
        });

      case "qs.recurse_left_call":
        return pickMode(mode, {
          explain:
            typeof recurseLo === "number" && typeof recurseHi === "number"
              ? `Recurse left segment ${recurseLo}–${recurseHi}.`
              : "Recurse left segment.",
          code: "quickSort(a, lo, p - 1);",
          minimal: "L",
        });

      case "qs.recurse_left_return":
        return pickMode(mode, {
          explain: `Return from left recursion.`,
          code: "// return from left",
          minimal: "←L",
        });

      case "qs.recurse_right_call":
        return pickMode(mode, {
          explain:
            typeof recurseLo === "number" && typeof recurseHi === "number"
              ? `Recurse right segment ${recurseLo}–${recurseHi}.`
              : "Recurse right segment.",
          code: "quickSort(a, p + 1, hi);",
          minimal: "R",
        });

      case "qs.recurse_right_return":
        return pickMode(mode, {
          explain: `Return from right recursion.`,
          code: "// return from right",
          minimal: "←R",
        });

      case "qs.segment_done":
        return pickMode(mode, {
          explain: `Segment ${range} is sorted.`,
          code: "// segment sorted",
          minimal: "seg ✓",
        });

      case "qs.done":
        return pickMode(mode, {
          explain: "Array fully sorted.",
          code: "return;",
          minimal: "sorted",
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing quick-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default QUICK_SORT_NARRATION;
