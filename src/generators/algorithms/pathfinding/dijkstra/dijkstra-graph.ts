// src/generators/algorithms/pathfinding/dijkstra/dijkstra-graph.ts

export type GraphNode = {
  label: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight: number;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  source: string;
};

/**
 * 6-node, 9-edge undirected weighted graph.
 *
 *          A ----3---- B
 *         / \           \
 *        1    4          6
 *       /      \          \
 *      C ---2--- D ---1--- E
 *       \                 /
 *        7              2
 *         \           /
 *           -- F --
 *
 * Shortest paths from A:
 *   A=0, C=1, B=3, D=3, E=4, F=6
 */
export const DEFAULT_GRAPH: Graph = {
  source: "A",
  nodes: [
    { label: "A", x: 3, y: 1 },
    { label: "B", x: 9, y: 1 },
    { label: "C", x: 1, y: 5 },
    { label: "D", x: 6, y: 5 },
    { label: "E", x: 11, y: 5 },
    { label: "F", x: 6, y: 9 },
  ],
  edges: [
    { from: "A", to: "B", weight: 3 },
    { from: "A", to: "C", weight: 1 },
    { from: "A", to: "D", weight: 4 },
    { from: "C", to: "D", weight: 2 },
    { from: "B", to: "E", weight: 6 },
    { from: "D", to: "E", weight: 1 },
    { from: "C", to: "F", weight: 7 },
    { from: "E", to: "F", weight: 2 },
    { from: "D", to: "F", weight: 5 },
  ],
};

/** Build adjacency list from the edge list (undirected). */
export function buildAdj(graph: Graph): Map<string, { to: string; weight: number }[]> {
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const n of graph.nodes) adj.set(n.label, []);
  for (const e of graph.edges) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
    adj.get(e.to)!.push({ to: e.from, weight: e.weight });
  }
  return adj;
}

/** Canonical edge id — alphabetically smaller label first. */
export function edgeId(a: string, b: string): string {
  return a < b ? `dj:e:${a}-${b}` : `dj:e:${b}-${a}`;
}

/** Node id. */
export function nodeId(label: string): string {
  return `dj:n:${label}`;
}
