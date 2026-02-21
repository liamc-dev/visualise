export const DIJKSTRA_PSEUDO =
` [[dj.init]]function dijkstra(graph, source):[[/dj.init]]
   [[dj.init]]dist = {v: \u221e for v in graph}[[/dj.init]]
   [[dj.init]]dist[source] = 0[[/dj.init]]
   [[dj.init]]prev = {v: null for v in graph}[[/dj.init]]
   [[dj.init]]visited = {}[[/dj.init]]

   [[dj.pick]]while visited.size < n:[[/dj.pick]]
     [[dj.pick]]u = vertex with min dist not in visited[[/dj.pick]]

     [[dj.relax]]for each neighbor v of u with weight w:[[/dj.relax]]
       [[dj.relax]]if dist[u] + w < dist[v]:[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w[[/dj.update]]
         [[dj.update]]prev[v] = u[[/dj.update]]

     [[dj.visit]]visited.add(u)[[/dj.visit]]

   [[dj.done]]return dist, prev[[/dj.done]]
`;

export const DIJKSTRA_PSEUDO_POINTER_HINTS = {
  "dj.pick": ["u"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
