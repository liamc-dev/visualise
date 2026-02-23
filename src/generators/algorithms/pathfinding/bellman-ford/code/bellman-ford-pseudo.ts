export const BELLMAN_FORD_PSEUDO =
`// Bellman-Ford: shortest paths from source
// Can handle negative weights (Dijkstra cannot)
// Detects negative-weight cycles

[[bf.init]]function bellmanFord(V, edges, source):
   dist = array(V, \u221e)
   prev = array(V, null)[[/bf.init]]

   [[bf.source]]dist[source] = 0[[/bf.source]]

   // Relax all edges V-1 times
   [[bf.pass]]for i = 1 to V - 1:[[/bf.pass]]

     [[bf.edge]]for (u, v, w) in edges:[[/bf.edge]]

       [[bf.relax]]if dist[u] + w < dist[v]:[[/bf.relax]]
         [[bf.update]]dist[v] = dist[u] + w
         prev[v] = u[[/bf.update]]

   // Check for negative-weight cycles
   for (u, v, w) in edges:
     if dist[u] + w < dist[v]:
       error "negative cycle detected"

   [[bf.done]]return dist, prev[[/bf.done]]
`;

export const BELLMAN_FORD_PSEUDO_POINTER_HINTS = {
  "bf.pass": [],
  "bf.edge": ["u", "v"],
  "bf.relax": ["u", "v"],
  "bf.update": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BELLMAN_FORD_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
