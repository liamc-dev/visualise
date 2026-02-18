// src/generators/algorithms/sorting/heap-sort/heap-sort.narration.ts
import type { NarrationBundle, NarrationMode } from "../../../../types/algo-types";

type Meta = Record<string, unknown>;

function n(meta: Meta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === "number" ? v : undefined;
}

function b(meta: Meta, key: string): boolean | undefined {
  const v = meta[key];
  return typeof v === "boolean" ? v : undefined;
}

function pickMode(
  mode: NarrationMode,
  m: { explain: string; code: string; minimal: string }
) {
  return m[mode] ?? m.explain;
}

export const HEAP_SORT_NARRATION: NarrationBundle = {
  defaultMode: "explain",

  resolve(token, mode, ctx) {
    if (!token) {
      if ((import.meta as any)?.env?.DEV) {
        throw new Error("HeapSort narration: resolve() called without a token.");
      }
      return ""; // production fallback
    }

    const meta = (ctx.meta ?? {}) as Meta;

    // All narration facts come from meta (single source of truth)
    const heapSize = n(meta, "heapSize") ?? 0;

    // Indices (snapshotted by trace)
    const root = n(meta, "root");
    const child = n(meta, "child");
    const swapIdx = n(meta, "swapIdx");
    const end = n(meta, "end");

    // Value snapshots (snapshotted by trace)
    const rootVal = n(meta, "rootVal");
    const childVal = n(meta, "childVal");
    const swapVal = n(meta, "swapVal");

    // Extra derived info emitted by trace
    const leftChild = n(meta, "leftChild");
    const rightChild = n(meta, "rightChild");
    const hasLeft = b(meta, "hasLeft");
    const hasRight = b(meta, "hasRight");
    const maxVal = n(meta, "maxVal");

    switch (token) {
      case "hs.init":
        return pickMode(mode, {
          explain: `Build a max-heap so the largest value rises to index 0.`,
          code: `buildMaxHeap(a, n);`,
          minimal: `heapify`,
        });

      case "hs.build_heap":
        return pickMode(mode, {
          explain: `Heapify from the last parent down to index 0.`,
          code: `for (i = parent(n-1); i >= 0; i--) siftDown(a, i, n);`,
          minimal: `heapify`,
        });

      case "hs.extract_max": {
        const mv = maxVal ?? rootVal;
        const tailIdx =
          typeof end === "number" ? end : heapSize; // fallback should be rare now
        return pickMode(mode, {
          explain: `Move max ${mv ?? "value"} into the sorted tail at index ${tailIdx}.`,
          code: `swap(a, 0, end); siftDown(a, 0, end);`,
          minimal: `extract`,
        });
      }

      case "hs.sift_start":
        return pickMode(mode, {
          explain: `Sift down from index ${root ?? "?"} to restore the max-heap property.`,
          code: `int root = start;`,
          minimal: `sift`,
        });

      case "hs.loop_check": {
        if (typeof hasLeft === "boolean" && typeof leftChild === "number") {
          return pickMode(mode, {
            explain: hasLeft
              ? `Root has a left child at index ${leftChild} (inside heap) → continue.`
              : `No left child (index ${leftChild} ≥ heapSize ${heapSize}) → stop.`,
            code: `int left = left(root); if (left >= heapSize) return;`,
            minimal: hasLeft ? `has L` : `leaf`,
          });
        }
        return pickMode(mode, {
          explain: `If there is no left child inside the heap, stop (this node is a leaf).`,
          code: `if (left >= heapSize) return;`,
          minimal: `leaf?`,
        });
      }

      case "hs.pick_left":
        return pickMode(mode, {
          explain: `Compare parent ${rootVal ?? "?"} with left child ${childVal ?? "?"}; track the best swap candidate.`,
          code: `if (a[left] > a[swapIdx]) swapIdx = left;`,
          minimal: `check L`,
        });

      case "hs.choose_swap_left":
        return pickMode(mode, {
          explain: `Left child is larger → swap candidate becomes index ${child ?? "?"}.`,
          code: `swapIdx = left;`,
          minimal: `swap←L`,
        });

      case "hs.has_right": {
        if (typeof hasRight === "boolean" && typeof rightChild === "number") {
          return pickMode(mode, {
            explain: hasRight
              ? `Right child exists at index ${rightChild} → compare both children.`
              : `No right child (index ${rightChild} ≥ heapSize ${heapSize}) → left child is the only candidate.`,
            code: `boolean hasRight = right < heapSize;`,
            minimal: hasRight ? `has R` : `no R`,
          });
        }
        return pickMode(mode, {
          explain: `Check whether a right child exists (right index must be inside the heap).`,
          code: `boolean hasRight = right < heapSize;`,
          minimal: `R?`,
        });
      }

      case "hs.pick_right":
        return pickMode(mode, {
          explain: `Compare current best ${swapVal ?? "?"} with right child ${childVal ?? "?"}; keep the larger child as swap candidate.`,
          code: `if (a[right] > a[swapIdx]) swapIdx = right;`,
          minimal: `check R`,
        });

      case "hs.choose_swap_right":
        return pickMode(mode, {
          explain: `Right child is larger → swap candidate becomes index ${child ?? "?"}.`,
          code: `swapIdx = right;`,
          minimal: `swap←R`,
        });

      case "hs.keep":
        return pickMode(mode, {
          explain: `Parent is ≥ both children → heap property holds here; stop sifting.`,
          code: `if (swapIdx == root) return;`,
          minimal: `ok`,
        });

      case "hs.swap":
        return pickMode(mode, {
          explain: `Swap parent ${rootVal ?? "?"} with child ${swapVal ?? "?"}, then continue sifting from the new root.`,
          code: `swap(a, root, swapIdx); root = swapIdx;`,
          minimal: `swap`,
        });

      case "hs.done":
        return pickMode(mode, {
          explain: `Array fully sorted.`,
          code: `return;`,
          minimal: `done`,
        });

      default: {
        if ((import.meta as any)?.env?.DEV) {
          throw new Error(`Missing heap-sort narration for token: ${token}`);
        }
        return token; // production fallback
      }
    }
  },
};

export default HEAP_SORT_NARRATION;
