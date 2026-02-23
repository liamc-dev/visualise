export const BELLMAN_FORD_JAVA =
`// Bellman-Ford: shortest paths from source
// Can handle negative weights (Dijkstra cannot)
// Detects negative-weight cycles

[[bf.init]]static int[] bellmanFord(
    int V, int[][] edges, int src) {
  int[] dist = new int[V];
  int[] prev = new int[V];
  Arrays.fill(dist, Integer.MAX_VALUE);
  Arrays.fill(prev, -1);[[/bf.init]]

  [[bf.source]]dist[src] = 0;[[/bf.source]]

  // Relax all edges V-1 times
  [[bf.pass]]for (int i = 1; i < V; i++) {[[/bf.pass]]

    [[bf.edge]]for (int[] e : edges) {
      int u = e[0], v = e[1], w = e[2];[[/bf.edge]]

      [[bf.relax]]if (dist[u] != Integer.MAX_VALUE
          && dist[u] + w < dist[v]) {[[/bf.relax]]
        [[bf.update]]dist[v] = dist[u] + w;
        prev[v] = u;[[/bf.update]]
      }
    }
  }

  // Check for negative-weight cycles
  for (int[] e : edges) {
    int u = e[0], v = e[1], w = e[2];
    if (dist[u] != Integer.MAX_VALUE
        && dist[u] + w < dist[v]) {
      throw new RuntimeException(
        "negative cycle detected");
    }
  }

  [[bf.done]]return dist;[[/bf.done]]
}`;

export const BELLMAN_FORD_JAVA_POINTER_HINTS = {
  "bf.pass": [],
  "bf.edge": ["u", "v"],
  "bf.relax": ["u", "v"],
  "bf.update": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BELLMAN_FORD_JAVA_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
