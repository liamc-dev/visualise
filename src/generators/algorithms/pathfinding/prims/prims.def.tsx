import type { AlgorithmDef } from "../../registry";

import { PRIMS_BUNDLE } from "./code/prims.bundle";
import { PRIMS_NARRATION } from "./prims.narration";
import { primsTrace } from "./prims-trace";

const def: AlgorithmDef = {
  label: "Prim's MST",
  category: "Pathfinding",
  trace: primsTrace,

  description: (
    <>
      <strong>Prim&rsquo;s algorithm</strong> builds a minimum spanning tree by
      greedily adding the cheapest edge crossing the cut between visited and
      unvisited nodes. Unlike Dijkstra, it compares edge weight directly
      instead of accumulated cost. Time complexity
      is <strong>O(V&sup2;)</strong> with a simple loop, or{" "}
      <strong>O(E log V)</strong> with a priority queue.
    </>
  ),

  bullets: [
    "Greedy: always picks the lightest edge crossing the MST cut",
    "Compares edge weight w directly, not accumulated dist[u] + w",
    "Same graph topology as Dijkstra for easy comparison",
    "O(V\u00B2) simple loop, O(E log V) with a min-heap",
  ],

  codeBundle: PRIMS_BUNDLE,
  narrationBundle: PRIMS_NARRATION,
};

export default def;
