import type { AlgorithmDef } from "../../registry";

import { COUNTING_SORT_BUNDLE } from "./code/counting-sort.bundle";
import { COUNTING_SORT_NARRATION } from "./counting-sort.narration";
import { countingSortTrace } from "./counting-sort-trace";

const def: AlgorithmDef = {
  label: "Counting Sort",
  category: "Sorting",
  trace: countingSortTrace,
  description: (
    <>
      <strong>Counting Sort</strong> is a non-comparison integer sorting
      algorithm that counts occurrences of each value, builds prefix sums, and
      uses them to place elements directly into their sorted positions. It runs
      in linear time when the range of values is not significantly larger than
      the number of elements.
    </>
  ),
  bullets: [
    "Time: O(n + k) where k = max value + 1",
    "Space: O(n + k)",
    "Stable sort — preserves relative order of equal keys",
    "Not comparison-based — uses value-indexed counting",
  ],
  codeBundle: COUNTING_SORT_BUNDLE,
  narrationBundle: COUNTING_SORT_NARRATION,
};

export default def;
