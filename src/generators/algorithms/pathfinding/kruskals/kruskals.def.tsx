import type { AlgorithmDef } from "../../registry";

import { KRUSKALS_BUNDLE } from "./code/kruskals.bundle";
import { KRUSKALS_NARRATION } from "./kruskals.narration";
import { kruskalsTrace } from "./kruskals-trace";

const def: AlgorithmDef = {
  label: "Kruskal's MST",
  category: "Pathfinding",
  trace: kruskalsTrace,

  description: (
    <>
      <strong>Kruskal&rsquo;s algorithm</strong> builds a minimum spanning tree by
      sorting all edges by weight and greedily adding each edge that connects two
      different components. A union-find (disjoint set) data structure detects
      cycles in near-constant time. Time complexity
      is <strong>O(E log E)</strong>.
    </>
  ),

  bullets: [
    "Greedy: always picks the lightest edge that doesn\u2019t form a cycle",
    "Union-Find detects same-component edges in \u03B1(V) amortized time",
    "Same graph topology as Dijkstra/Prim\u2019s for easy comparison",
    "O(E log E) dominated by the initial edge sort",
  ],

  codeBundle: KRUSKALS_BUNDLE,
  narrationBundle: KRUSKALS_NARRATION,
};

export default def;
