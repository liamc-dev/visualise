export type GraphNode = {
  label: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  source: string;
};

/**
 * 6-node, 9-edge undirected unweighted graph.
 * Same topology as Dijkstra, without weights.
 *
 *          A --------- B
 *         / \           \
 *        /   \           \
 *       C ---- D -------- E
 *        \               /
 *         \             /
 *           --- F ----
 *
 * BFS from A (alphabetical neighbor order):
 *   Level 0: A
 *   Level 1: B, C, D
 *   Level 2: E, F
 */
export const DEFAULT_BFS_GRAPH: Graph = {
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
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "A", to: "D" },
    { from: "C", to: "D" },
    { from: "B", to: "E" },
    { from: "D", to: "E" },
    { from: "C", to: "F" },
    { from: "E", to: "F" },
    { from: "D", to: "F" },
  ],
};

/** Build adjacency list from the edge list (undirected). */
export function buildAdj(graph: Graph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const n of graph.nodes) adj.set(n.label, []);
  for (const e of graph.edges) {
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }
  // Sort neighbors alphabetically for deterministic traversal
  for (const [, neighbors] of adj) neighbors.sort();
  return adj;
}

/** Canonical edge id -- alphabetically smaller label first. */
export function edgeId(a: string, b: string): string {
  return a < b ? `bfs:e:${a}-${b}` : `bfs:e:${b}-${a}`;
}

/** Node id. */
export function nodeId(label: string): string {
  return `bfs:n:${label}`;
}
