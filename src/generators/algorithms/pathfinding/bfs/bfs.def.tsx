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
      <strong>Breadth-First Search (BFS)</strong> explores a grid cell by cell,
      expanding outward from the source in concentric diamond wavefronts. It
      uses a FIFO queue to process all cells at distance <em>k</em> before any
      at distance <em>k+1</em>, guaranteeing shortest paths on unweighted
      grids. Time complexity is <strong>O(R &times; C)</strong>.
    </>
  ),

  bullets: [
    "Wavefront expands as concentric diamonds on a grid",
    "Uses a FIFO queue \u2014 first in, first out",
    "Visits all cells at distance k before distance k+1",
    "Guarantees shortest paths on unweighted grids",
  ],

  codeBundle: BFS_BUNDLE,
  narrationBundle: BFS_NARRATION,
};

export default def;
