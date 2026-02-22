import type { AlgorithmDef } from "../../registry";

import { DFS_BUNDLE } from "./code/dfs.bundle";
import { DFS_NARRATION } from "./dfs.narration";
import { dfsTrace } from "./dfs-trace";

const def: AlgorithmDef = {
  label: "Depth-First Search",
  category: "Pathfinding",
  trace: dfsTrace,

  description: (
    <>
      <strong>Depth-First Search (DFS)</strong> explores a grid by diving as
      deep as possible along each path before backtracking. It uses a LIFO stack
      to always process the most recently discovered cell first, creating long
      corridor-like exploration patterns. Unlike BFS, DFS does{" "}
      <em>not</em> guarantee shortest paths. Time complexity is{" "}
      <strong>O(R &times; C)</strong>.
    </>
  ),

  bullets: [
    "Explores as deep as possible before backtracking",
    "Uses a LIFO stack \u2014 last in, first out",
    "Cells show discovery order, not shortest distance",
    "Does not guarantee shortest paths on grids",
  ],

  codeBundle: DFS_BUNDLE,
  narrationBundle: DFS_NARRATION,
};

export default def;
