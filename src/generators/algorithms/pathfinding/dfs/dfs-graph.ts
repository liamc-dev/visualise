// src/generators/algorithms/pathfinding/dfs/dfs-graph.ts
// Re-exports shared graph types/functions from dijkstra, defines dfs: prefixed ID helpers.

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

/** Canonical edge id — alphabetically smaller label first (dfs prefix). */
export function edgeId(a: string, b: string): string {
  return a < b ? `dfs:e:${a}-${b}` : `dfs:e:${b}-${a}`;
}

/** Node id (dfs prefix). */
export function nodeId(label: string): string {
  return `dfs:n:${label}`;
}
