import type { AlgorithmDef } from "../../registry";

import { DIJKSTRA_BUNDLE } from "./code/dijkstra.bundle";
import { DIJKSTRA_NARRATION } from "./dijkstra.narration";
import { dijkstraTrace } from "./dijkstra-trace";

const def: AlgorithmDef = {
  label: "Dijkstra's Algorithm",
  category: "Pathfinding",
  trace: dijkstraTrace,

  description: (
    <>
      <strong>Dijkstra's Algorithm</strong> finds the shortest path from a
      source node to every other node in a weighted graph with non-negative
      edge weights. It greedily picks the unvisited node with the smallest
      tentative distance, then relaxes all its neighbors. Time complexity is{" "}
      <strong>O(V²)</strong> with a simple array, or{" "}
      <strong>O((V + E) log V)</strong> with a priority queue.
    </>
  ),

  bullets: [
    "Greedy strategy: always process the closest unvisited node",
    "Relaxation: if a shorter path is found, update the distance",
    "Produces a shortest-path tree from the source",
    "Requires non-negative edge weights",
  ],

  codeBundle: DIJKSTRA_BUNDLE,
  narrationBundle: DIJKSTRA_NARRATION,
};

export default def;
