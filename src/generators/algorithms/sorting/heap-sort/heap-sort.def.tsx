// src/generators/algorithms/sorting/heap-sort/heap-sort.def.tsx
import type { AlgorithmDef } from "../../registry";

import { HEAP_SORT_BUNDLE } from "./code/heap-sort.bundle";
import { HEAP_SORT_NARRATION } from "./heap-sort.narration";

import { heapSortTrace } from "./heap-sort-trace";

const def: AlgorithmDef = {
  label: "Heap Sort",
  category: "Sorting",

  trace: heapSortTrace,

  description: (
    <>
      <strong>Heap Sort</strong> works in two phases: first it builds a{" "}
      <strong>max-heap</strong> (so the largest element is at index 0), then it
      repeatedly swaps the max element with the last element in the heap and{" "}
      <strong>sifts down</strong> to restore the heap property. It runs in{" "}
      <strong>O(n log n)</strong> time, is <strong>in-place</strong>, and is
      usually <strong>not stable</strong>.
    </>
  ),

  bullets: [
    "Mental model: heap = ‘max at the top’ (index 0)",
    "Build phase: heapify from the last parent down to 0",
    "Sort phase: swap max to the end, shrink heap, sift down",
    "O(n log n), in-place, not stable",
  ],

  codeBundle: HEAP_SORT_BUNDLE,
  narrationBundle: HEAP_SORT_NARRATION,
};

export default def;
