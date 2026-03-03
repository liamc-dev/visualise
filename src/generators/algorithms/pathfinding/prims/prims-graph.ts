// src/generators/algorithms/pathfinding/prims/prims-graph.ts
// Re-exports shared graph types/functions from dijkstra, defines pr: prefixed ID helpers.

export type {
  GraphNode,
  GraphEdge,
  Graph,
} from "../dijkstra/dijkstra-graph";

export {
  NODE_POSITIONS,
  buildGraphFromInput,
  buildAdj,
} from "../dijkstra/dijkstra-graph";

/** Canonical edge id — alphabetically smaller label first (pr prefix). */
export function edgeId(a: string, b: string): string {
  return a < b ? `pr:e:${a}-${b}` : `pr:e:${b}-${a}`;
}

/** Node id (pr prefix). */
export function nodeId(label: string): string {
  return `pr:n:${label}`;
}
