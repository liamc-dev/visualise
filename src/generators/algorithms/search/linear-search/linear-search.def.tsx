import type { AlgorithmDef } from "../../registry";

import { LINEAR_SEARCH_BUNDLE } from "./code/linear-search.bundle";
import { LINEAR_SEARCH_NARRATION } from "./linear-search.narration";
import { linearSearchTrace } from "./linear-search-trace";

const def: AlgorithmDef = {
  label: "Linear Search",
  category: "Search",
  trace: linearSearchTrace,

  description: (
    <>
      <strong>Linear Search</strong> scans each element of the array from left
      to right until the target is found or the end is reached. It works on
      unsorted arrays. Time complexity is <strong>O(n)</strong> with{" "}
      <strong>O(1)</strong> extra space.
    </>
  ),

  bullets: [
    "Works on any array — no sorting required",
    "Scans left to right: O(n) worst case",
    "Returns the first index where target is found",
    "O(1) extra memory — only tracks the current index",
  ],

  codeBundle: LINEAR_SEARCH_BUNDLE,
  narrationBundle: LINEAR_SEARCH_NARRATION,
};

export default def;
