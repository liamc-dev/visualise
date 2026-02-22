import type { AlgorithmDef } from "../../registry";

import { SELECTION_SORT_BUNDLE } from "./code/selection-sort.bundle";
import { SELECTION_SORT_NARRATION } from "./selection-sort.narration";
import { selectionSortTrace } from "./selection-sort-trace";

const def: AlgorithmDef = {
  label: "Selection Sort",
  category: "Sorting",
  trace: selectionSortTrace,

  description: (
    <>
      <strong>Selection Sort</strong> repeatedly finds the minimum element in
      the unsorted portion and swaps it into the next sorted position. It makes
      at most <strong>O(n)</strong> swaps, but always performs{" "}
      <strong>O(n²)</strong> comparisons regardless of input order.
    </>
  ),

  bullets: [
    "Mental model: pick the smallest, place it next",
    "Not stable — swaps can reorder equal elements",
    "O(n²) comparisons in all cases, O(n) swaps",
    "In-place with O(1) extra memory",
  ],

  codeBundle: SELECTION_SORT_BUNDLE,
  narrationBundle: SELECTION_SORT_NARRATION,
};

export default def;
