import type { AlgorithmDef } from "../../registry";

import { INSERTION_SORT_BUNDLE } from "./code/insertion-sort.bundle";
import { INSERTION_SORT_NARRATION } from "./insertion-sort.narration";
import { insertionSortTrace } from "./insertion-sort-trace";

const def: AlgorithmDef = {
  label: "Insertion Sort",
  category: "Sorting",
  trace: insertionSortTrace,

  description: (
    <>
      <strong>Insertion Sort</strong> builds the sorted array one element at a
      time. It picks each value and scans left through the sorted portion,
      shifting larger elements right until the correct insertion point is found.
      Average and worst-case time is <strong>O(n&sup2;)</strong>, but it is{" "}
      <strong>stable</strong>, <strong>in-place</strong>, and very efficient on
      nearly-sorted data.
    </>
  ),

  bullets: [
    "Mental model: pick a card, slide it into the right spot",
    "Stable sort \u2014 equal elements keep their original order",
    "O(n\u00B2) comparisons and shifts in average/worst case",
    "In-place with O(1) extra memory",
  ],

  codeBundle: INSERTION_SORT_BUNDLE,
  narrationBundle: INSERTION_SORT_NARRATION,
};

export default def;
