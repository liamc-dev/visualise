export const DIJKSTRA_PY =
` [[dj.init]]def dijkstra(graph, source):[[/dj.init]]
   [[dj.init]]dist = {v: float('inf') for v in graph}[[/dj.init]]
   [[dj.init]]prev = {v: None for v in graph}[[/dj.init]]
   [[dj.init]]visited = set()[[/dj.init]]
   [[dj.init]]dist[source] = 0[[/dj.init]]

   [[dj.pick]]while len(visited) < len(graph):[[/dj.pick]]
     [[dj.pick]]u = min((v for v in graph if v not in visited), key=lambda v: dist[v])[[/dj.pick]]

     [[dj.relax]]for v, w in graph[u]:[[/dj.relax]]
       [[dj.relax]]if dist[u] + w < dist[v]:[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w[[/dj.update]]
         [[dj.update]]prev[v] = u[[/dj.update]]

     [[dj.visit]]visited.add(u)[[/dj.visit]]

   [[dj.done]]return dist, prev[[/dj.done]]
`;

export const DIJKSTRA_PY_POINTER_HINTS = {
  "dj.pick": ["u"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PY_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
