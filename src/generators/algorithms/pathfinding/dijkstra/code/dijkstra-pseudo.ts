export const DIJKSTRA_PSEUDO =
`function dijkstra(graph, source):
   [[dj.init.dist]]dist = {v: \u221e for v in graph}[[/dj.init.dist]]
   [[dj.init.prev]]prev = {v: null for v in graph}[[/dj.init.prev]]
   [[dj.init.visited]]visited = {}[[/dj.init.visited]]
   [[dj.init.setdist]]dist[source] = 0[[/dj.init.setdist]]

   [[dj.loop]]while visited.size < n:[[/dj.loop]]
     [[dj.pick]]u = vertex with min dist not in visited[[/dj.pick]]

     [[dj.neighbors]]for each neighbor v of u with weight w:[[/dj.neighbors]]
       [[dj.check.visited]]if v in visited:[[/dj.check.visited]]
         [[dj.check.visited]]continue[[/dj.check.visited]]
       [[dj.relax]]if dist[u] + w < dist[v]:[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w[[/dj.update]]
         [[dj.update]]prev[v] = u[[/dj.update]]

     [[dj.visit]]visited.add(u)[[/dj.visit]]

   [[dj.done]]return dist, prev[[/dj.done]]
`;

export const DIJKSTRA_PSEUDO_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
