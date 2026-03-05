import type { AlgorithmDef } from "../../registry";
import { KNN_BUNDLE } from "./code/knn.bundle";
import { KNN_NARRATION } from "./knn.narration";
import { knnTrace } from "./knn-trace";

const def: AlgorithmDef = {
  label: "KNN Classification",
  category: "Machine Learning",
  trace: knnTrace,
  description: (
    <>
      <strong>K-Nearest Neighbors</strong> classifies each point by majority
      vote of its <em>k</em> closest training neighbors. Leave-one-out
      cross-validation tests every point as a query against the rest.
      Complexity is <strong>O(n²)</strong> distance computations.
    </>
  ),
  bullets: [
    "Instance-based: no model training, just distance lookups",
    "Leave-one-out: each point takes a turn as the query",
    "Majority vote of k nearest neighbors decides the class",
    "Auto-labels points by diagonal split (x+y)",
  ],
  codeBundle: KNN_BUNDLE,
  narrationBundle: KNN_NARRATION,
};

export default def;
