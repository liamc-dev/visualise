import type { AlgorithmDef } from "../../registry";

import { BELLMAN_FORD_BUNDLE } from "./code/bellman-ford.bundle";
import { BELLMAN_FORD_NARRATION } from "./bellman-ford.narration";
import { bellmanFordTrace } from "./bellman-ford-trace";

const def: AlgorithmDef = {
  label: "Bellman-Ford",
  category: "Pathfinding",
  trace: bellmanFordTrace,

  description: (
    <>
      <strong>Bellman-Ford</strong> finds the shortest path from a source node
      to every other node by relaxing all edges V-1 times. Unlike Dijkstra, it
      can handle negative edge weights (though this demo uses positive weights).
      Time complexity is <strong>O(V &middot; E)</strong>.
    </>
  ),

  bullets: [
    "Relaxes every edge V-1 times to propagate shortest distances",
    "Handles negative edge weights (Dijkstra cannot)",
    "Same graph topology as Dijkstra for easy comparison",
    "O(V \u00B7 E) time \u2014 slower than Dijkstra but more general",
  ],

  codeBundle: BELLMAN_FORD_BUNDLE,
  narrationBundle: BELLMAN_FORD_NARRATION,
};

export default def;
