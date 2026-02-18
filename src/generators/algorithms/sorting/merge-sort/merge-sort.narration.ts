// src/generators/algorithms/sorting/merge-sort/merge-sort.narration.ts
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

export const MERGE_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("MergeSort narration: resolve() called without a token.");
      }
      return "";
    }

    const meta = (ctx.meta ?? {}) as Meta;

    // Range info (from standard meta)
    const lo = n(meta, "lo");
    const hi = n(meta, "hi");
    const mid = n(meta, "mid");
    const depth = n(meta, "depth");
    const phase = s(meta, "phase");
    const isRoot = b(meta, "isRoot");
    const isBaseCase = b(meta, "isBaseCase");
    const side = s(meta, "side"); // "left" | "right"
    const from = s(meta, "from"); // "left" | "right"

    // Merge info (from standard meta)
    const mergeLo = n(meta, "mergeLo");
    const mergeMid = n(meta, "mergeMid");
    const mergeHi = n(meta, "mergeHi");
    const leftSize = n(meta, "leftSize");
    const totalSize = n(meta, "totalSize");

    // Snapshot indices (from meta — do NOT depend on pointer filtering)
    const i = n(meta, "iBefore") ?? n(meta, "i");
    const j = n(meta, "jBefore") ?? n(meta, "j");
    const k = n(meta, "kBefore") ?? n(meta, "k");

    // Write facts
    const written = n(meta, "written");
    const takeLeft = b(meta, "takeLeft");
    const remaining = s(meta, "remaining"); // "left" | "right"

    const range =
      typeof lo === "number" && typeof hi === "number" ? `${lo}–${hi}` : "?–?";

    const mergeRange =
      typeof mergeLo === "number" &&
      typeof mergeMid === "number" &&
      typeof mergeHi === "number"
        ? `${mergeLo}–${mergeMid} and ${mergeMid + 1}–${mergeHi}`
        : "?";

    switch (token) {
      case "ms.init":
        return pickMode(mode, {
          explain: `Start merge sort on the full array (split down to size 1, then merge back up).`,
          code: `mergeSort(a, 0, n - 1);`,
          minimal: `start`,
        });

      case "ms.split":
        return pickMode(mode, {
          explain:
            typeof mid === "number"
              ? `Split range ${range} at mid=${mid}.`
              : `Split range ${range} into two halves.`,
          code: `mid = (lo + hi) / 2;`,
          minimal: `split ${range}`,
        });

      case "ms.recurse_left":
        return pickMode(mode, {
          explain: `Recurse into the left half of ${range}.`,
          code: `mergeSort(a, lo, mid);`,
          minimal: `L ${range}`,
        });

      case "ms.recurse_right":
        return pickMode(mode, {
          explain: `Recurse into the right half of ${range}.`,
          code: `mergeSort(a, mid + 1, hi);`,
          minimal: `R ${range}`,
        });

      case "ms.base_return":
        return pickMode(mode, {
          explain: `Base case at ${range}: size 1 → already sorted.`,
          code: `if (lo >= hi) return;`,
          minimal: `base`,
        });

      case "ms.return_left":
        return pickMode(mode, {
          explain: `Left recursion finished for ${range} → back to parent.`,
          code: `// returned from left`,
          minimal: `←L`,
        });

      case "ms.return_right":
        return pickMode(mode, {
          explain: `Right recursion finished for ${range} → back to parent.`,
          code: `// returned from right`,
          minimal: `←R`,
        });

      case "ms.merge_start":
        return pickMode(mode, {
          explain: `Begin merge: ${mergeRange}.`,
          code: `temp = copy(a[lo..hi]); i=0; j=leftSize; k=lo;`,
          minimal: `merge`,
        });

      case "ms.merge_compare":
        return pickMode(mode, {
          explain:
            typeof i === "number" && typeof j === "number"
              ? `Compare fronts: temp[i=${i}] vs temp[j=${j}] (choose smaller).`
              : `Compare the fronts of the two halves (choose smaller).`,
          code: `if (temp[i] <= temp[j]) ... else ...`,
          minimal: `cmp`,
        });

      case "ms.merge_write_left":
        return pickMode(mode, {
          explain:
            typeof written === "number" && typeof k === "number"
              ? `Take left → write ${written} into a[${k}].`
              : `Take from left half → write into the array.`,
          code: `a[k] = temp[i]; i++; k++;`,
          minimal: `←L`,
        });

      case "ms.merge_write_right":
        return pickMode(mode, {
          explain:
            typeof written === "number" && typeof k === "number"
              ? `Take right → write ${written} into a[${k}].`
              : `Take from right half → write into the array.`,
          code: `a[k] = temp[j]; j++; k++;`,
          minimal: `←R`,
        });

      case "ms.merge_write_remaining_left":
        return pickMode(mode, {
          explain:
            typeof written === "number" && typeof k === "number"
              ? `Right half exhausted → write remaining left ${written} into a[${k}].`
              : `Right half exhausted → write remaining left values.`,
          code: `while (i < leftSize) a[k++] = temp[i++];`,
          minimal: `rem L`,
        });

      case "ms.merge_write_remaining_right":
        return pickMode(mode, {
          explain:
            typeof written === "number" && typeof k === "number"
              ? `Left half exhausted → write remaining right ${written} into a[${k}].`
              : `Left half exhausted → write remaining right values.`,
          code: `while (j < totalSize) a[k++] = temp[j++];`,
          minimal: `rem R`,
        });

      case "ms.merge_done":
        return pickMode(mode, {
          explain: `Merge complete for ${range}.`,
          code: `// merged a[lo..hi]`,
          minimal: `done`,
        });

      case "ms.return":
        return pickMode(mode, {
          explain: `Finished sorting ${range}.`,
          code: `return;`,
          minimal: `ret`,
        });

      case "ms.done":
        return pickMode(mode, {
          explain: `Array fully sorted.`,
          code: `return;`,
          minimal: `sorted`,
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing merge-sort narration for token: ${token}`);
        }
        return token;
      }
    }
  },
};

export default MERGE_SORT_NARRATION;
