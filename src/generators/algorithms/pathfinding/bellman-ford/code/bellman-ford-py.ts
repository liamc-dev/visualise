export const BELLMAN_FORD_PY =
`# Bellman-Ford: shortest paths from source
# Can handle negative weights (Dijkstra cannot)
# Detects negative-weight cycles

[[bf.init]]def bellman_ford(V, edges, src):
  dist = [float('inf')] * V
  prev = [None] * V[[/bf.init]]

  [[bf.source]]dist[src] = 0[[/bf.source]]

  # Relax all edges V-1 times
  [[bf.pass]]for i in range(1, V):[[/bf.pass]]

    [[bf.edge]]for u, v, w in edges:[[/bf.edge]]

      [[bf.relax]]if dist[u] != float('inf') and dist[u] + w < dist[v]:[[/bf.relax]]
        [[bf.update]]dist[v] = dist[u] + w
        prev[v] = u[[/bf.update]]

  # Check for negative-weight cycles
  for u, v, w in edges:
    if dist[u] != float('inf') and dist[u] + w < dist[v]:
      raise ValueError("negative cycle detected")

  [[bf.done]]return dist, prev[[/bf.done]]
`;

export const BELLMAN_FORD_PY_POINTER_HINTS = {
  "bf.pass": [],
  "bf.edge": ["u", "v"],
  "bf.relax": ["u", "v"],
  "bf.update": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BELLMAN_FORD_PY_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
