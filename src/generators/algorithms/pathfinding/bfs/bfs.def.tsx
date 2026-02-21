import type { AlgorithmDef } from "../../registry";

import { BFS_BUNDLE } from "./code/bfs.bundle";
import { BFS_NARRATION } from "./bfs.narration";
import { bfsTrace } from "./bfs-trace";

const def: AlgorithmDef = {
  label: "Breadth-First Search",
  category: "Pathfinding",
  trace: bfsTrace,

  description: (
    <>
      <strong>Breadth-First Search (BFS)</strong> explores a graph layer by
      layer, visiting all neighbors at the current depth before moving to the
      next level. It uses a FIFO queue and finds the shortest path (in number
      of hops) from the source to every reachable node. Time complexity is{" "}
      <strong>O(V + E)</strong>.
    </>
  ),

  bullets: [
    "Layer-by-layer exploration using a FIFO queue",
    "Finds shortest paths in unweighted graphs",
    "Discovers all nodes at distance k before distance k+1",
    "Produces a BFS tree from the source",
  ],

  codeBundle: BFS_BUNDLE,
  narrationBundle: BFS_NARRATION,
};

export default def;
