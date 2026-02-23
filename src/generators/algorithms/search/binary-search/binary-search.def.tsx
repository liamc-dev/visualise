import type { AlgorithmDef } from "../../registry";

import { BINARY_SEARCH_BUNDLE } from "./code/binary-search.bundle";
import { BINARY_SEARCH_NARRATION } from "./binary-search.narration";
import { binarySearchTrace } from "./binary-search-trace";

const def: AlgorithmDef = {
  label: "Binary Search",
  category: "Search",
  trace: binarySearchTrace,

  description: (
    <>
      <strong>Binary Search</strong> finds a target value in a sorted array by
      repeatedly halving the search space. It compares the target to the middle
      element and eliminates the half where the target cannot lie.
      Time complexity is <strong>O(log n)</strong> with{" "}
      <strong>O(1)</strong> extra space.
    </>
  ),

  bullets: [
    "Requires a sorted array as input",
    "Halves the search space each step — O(log n) time",
    "Compares target to midpoint: go left, go right, or found",
    "O(1) extra memory — only tracks lo, hi, and mid",
  ],

  codeBundle: BINARY_SEARCH_BUNDLE,
  narrationBundle: BINARY_SEARCH_NARRATION,
};

export default def;
