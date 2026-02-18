import type { AlgorithmDef } from "../../registry";

import { QUICK_SORT_BUNDLE } from "../quick-sort/code/quick-sort.bundle";
import { QUICK_SORT_NARRATION } from "./quick-sort.narration";

import { quickSortTrace } from "./quick-sort-trace";

const def: AlgorithmDef = {
  label: "Quick Sort",
  category: "Sorting",
  trace: quickSortTrace,

  description: (
    <>
      <strong>Quick Sort</strong> is a “pick a pivot → partition → recurse”
      algorithm. It chooses a pivot value, then rearranges the array so that
      values <strong>less than the pivot</strong> move left and values{" "}
      <strong>greater</strong> move right. After partitioning, the pivot is in
      its final position, and Quick Sort recursively sorts the left and right
      sides. Average time is <strong>O(n log n)</strong>, worst case{" "}
      <strong>O(n²)</strong>, and it is usually <strong>not stable</strong>.
    </>
  ),

  bullets: [
    "Mental model: pivot is a ‘wall’—smaller goes left, larger goes right",
    "After partition: pivot is guaranteed in its final sorted index",
    "Average O(n log n) and in-place (low extra memory)",
    "Worst case O(n²) if pivot choices are consistently bad",
  ],

  codeBundle: QUICK_SORT_BUNDLE,
  narrationBundle: QUICK_SORT_NARRATION,
};

export default def;
