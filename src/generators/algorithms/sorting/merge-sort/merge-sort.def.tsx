import type { AlgorithmDef } from "../../registry";

import { MERGE_SORT_BUNDLE } from "./code/merge-sort.bundle";
import { MERGE_SORT_NARRATION } from "./merge-sort.narration";

import { mergeSortTrace } from "./merge-sort-trace";

const def: AlgorithmDef = {
  label: "Merge Sort",
  category: "Sorting",

  trace: mergeSortTrace,


  description: (
    <>
      <strong>Merge Sort</strong> is a “divide → conquer → combine” algorithm. It
      repeatedly splits the array into halves until each piece is size 1, then
      merges pieces back together in sorted order by always taking the smallest
      front element from two lists. It runs in <strong>O(n log n)</strong> time
      and is <strong>stable</strong>.
    </>
  ),

  bullets: [
    "Mental model: split into halves, then merge two sorted lists",
    "Key step: merging compares only the front of each half",
    "Stable: equal values keep their original order",
    "Always O(n log n), but uses extra memory for merging",
  ],

  codeBundle: MERGE_SORT_BUNDLE,
  narrationBundle: MERGE_SORT_NARRATION,
};

export default def;
