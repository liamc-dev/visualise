import type { AlgorithmDef } from "../../registry";

import { ASTAR_BUNDLE } from "./code/a-star.bundle";
import { ASTAR_NARRATION } from "./a-star.narration";
import { astarTrace } from "./a-star-trace";

const def: AlgorithmDef = {
  label: "A* Search",
  category: "Pathfinding",
  trace: astarTrace,

  description: (
    <>
      <strong>A* Search</strong> finds the shortest path between a start and
      goal in a weighted grid. It extends Dijkstra with a heuristic (Manhattan
      distance) to focus the search toward the goal, exploring fewer cells.
      Optimal when the heuristic is admissible. Time complexity is{" "}
      <strong>O(V²)</strong> with a simple scan, or{" "}
      <strong>O((V + E) log V)</strong> with a priority queue.
    </>
  ),

  bullets: [
    "f(n) = g(n) + h(n): actual cost + estimated remaining cost",
    "Heuristic: Manhattan distance (admissible for 4-connected grids)",
    "Explores fewer cells than Dijkstra by steering toward the goal",
    "Optimal and complete when the heuristic never overestimates",
  ],

  codeBundle: ASTAR_BUNDLE,
  narrationBundle: ASTAR_NARRATION,
};

export default def;
