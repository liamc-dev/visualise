// src/generators/algorithms/pathfinding/bellman-ford/bellman-ford-graph.ts
// Re-exports shared graph types/functions from dijkstra, defines bf: prefixed ID helpers.

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

/** Canonical edge id — alphabetically smaller label first (bf prefix). */
export function edgeId(a: string, b: string): string {
  return a < b ? `bf:e:${a}-${b}` : `bf:e:${b}-${a}`;
}

/** Node id (bf prefix). */
export function nodeId(label: string): string {
  return `bf:n:${label}`;
}
