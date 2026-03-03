// src/generators/algorithms/pathfinding/kruskals/kruskals-graph.ts
// Re-exports shared graph types/functions from dijkstra, defines kr: prefixed ID helpers.

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

/** Canonical edge id — alphabetically smaller label first (kr prefix). */
export function edgeId(a: string, b: string): string {
  return a < b ? `kr:e:${a}-${b}` : `kr:e:${b}-${a}`;
}

/** Node id (kr prefix). */
export function nodeId(label: string): string {
  return `kr:n:${label}`;
}
