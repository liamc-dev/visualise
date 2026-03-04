import type { AlgorithmDef } from "../../registry";
import { KMEANS_BUNDLE } from "./code/kmeans.bundle";
import { KMEANS_NARRATION } from "./kmeans.narration";
import { kmeansTrace } from "./kmeans-trace";

const def: AlgorithmDef = {
  label: "K-Means Clustering",
  category: "Machine Learning",
  trace: kmeansTrace,
  description: (
    <>
      <strong>K-Means Clustering</strong> partitions data points into{" "}
      <em>k</em> clusters by iteratively assigning each point to its nearest
      centroid then recomputing centroids as cluster means. It converges when
      no assignments change. Each iteration is <strong>O(nk)</strong>.
    </>
  ),
  bullets: [
    "Unsupervised: discovers groups without labels",
    "Assign step: each point joins its nearest centroid",
    "Update step: centroids move to cluster means",
    "Converges when assignments stabilise",
  ],
  codeBundle: KMEANS_BUNDLE,
  narrationBundle: KMEANS_NARRATION,
};

export default def;
