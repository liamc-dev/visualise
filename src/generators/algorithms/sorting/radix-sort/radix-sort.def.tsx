import type { AlgorithmDef } from "../../registry";

import { RADIX_SORT_BUNDLE } from "./code/radix-sort.bundle";
import { RADIX_SORT_NARRATION } from "./radix-sort.narration";
import { radixSortTrace } from "./radix-sort-trace";

const def: AlgorithmDef = {
  label: "Radix Sort",
  category: "Sorting",
  trace: radixSortTrace,
  description: (
    <>
      <strong>Radix Sort (LSD)</strong> is a non-comparison sorting algorithm
      that distributes elements into buckets by individual digits, processing
      from the least significant digit to the most significant. It achieves
      linear time complexity for fixed-width integers.
    </>
  ),
  bullets: [
    "Time: O(d * (n + k)) where d = digits, k = radix (10)",
    "Space: O(n + k)",
    "Stable sort — preserves relative order of equal keys",
    "Not comparison-based — uses digit extraction instead",
  ],
  codeBundle: RADIX_SORT_BUNDLE,
  narrationBundle: RADIX_SORT_NARRATION,
};

export default def;
