export const BELLMAN_FORD_TS =
`// Bellman-Ford: shortest paths from source
// Can handle negative weights (Dijkstra cannot)
// Detects negative-weight cycles

type Edge = { u: number; v: number; w: number };

[[bf.init]]function bellmanFord(
  V: number, edges: Edge[], src: number,
): { dist: number[]; prev: (number | null)[] } {
  const dist = Array(V).fill(Infinity);
  const prev: (number | null)[] = Array(V).fill(null);[[/bf.init]]

  [[bf.source]]dist[src] = 0;[[/bf.source]]

  // Relax all edges V-1 times
  [[bf.pass]]for (let i = 1; i < V; i++) {[[/bf.pass]]

    [[bf.edge]]for (const { u, v, w } of edges) {[[/bf.edge]]

      [[bf.relax]]if (dist[u] !== Infinity
          && dist[u] + w < dist[v]) {[[/bf.relax]]
        [[bf.update]]dist[v] = dist[u] + w;
        prev[v] = u;[[/bf.update]]
      }
    }
  }

  // Check for negative-weight cycles
  for (const { u, v, w } of edges) {
    if (dist[u] !== Infinity
        && dist[u] + w < dist[v]) {
      throw new Error("negative cycle detected");
    }
  }

  [[bf.done]]return { dist, prev };[[/bf.done]]
}`;

export const BELLMAN_FORD_TS_POINTER_HINTS = {
  "bf.pass": [],
  "bf.edge": ["u", "v"],
  "bf.relax": ["u", "v"],
  "bf.update": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BELLMAN_FORD_TS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
