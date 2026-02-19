import type { AlgorithmDef } from "../../registry";

import { BUBBLE_SORT_BUNDLE } from "./code/bubble-sort.bundle";
import { BUBBLE_SORT_NARRATION } from "./bubble-sort.narration";
import { bubbleSortTrace } from "./bubble-sort-trace";

const def: AlgorithmDef = {
  label: "Bubble Sort",
  category: "Sorting",
  trace: bubbleSortTrace,

  description: (
    <>
      <strong>Bubble Sort</strong> repeatedly steps through the array, comparing
      adjacent elements and swapping them if they are out of order. After each
      pass the largest unsorted element "bubbles up" to its final position.
      Average and worst-case time is <strong>O(n²)</strong>, but it is{" "}
      <strong>stable</strong> and <strong>in-place</strong>.
    </>
  ),

  bullets: [
    "Mental model: largest value bubbles to the end each pass",
    "Stable sort — equal elements keep their original order",
    "O(n²) comparisons and swaps in average/worst case",
    "In-place with O(1) extra memory",
  ],

  codeBundle: BUBBLE_SORT_BUNDLE,
  narrationBundle: BUBBLE_SORT_NARRATION,
};

export default def;
