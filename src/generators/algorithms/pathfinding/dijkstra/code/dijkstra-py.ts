export const DIJKSTRA_PY =
`dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]

def dijkstra(graph, source):
  nodes = graph.nodes
  n = len(nodes)

  [[dj.init.dist]]dist = {v: float('inf') for v in nodes}[[/dj.init.dist]]
  [[dj.init.prev]]prev = {v: None for v in nodes}[[/dj.init.prev]]
  [[dj.init.visited]]visited = set()[[/dj.init.visited]]
  [[dj.init.setdist]]dist[source] = 0[[/dj.init.setdist]]

  [[dj.loop]]while len(visited) < n:[[/dj.loop]]
    [[dj.pick]]u = min(
      (v for v in nodes if v not in visited),
      key=lambda v: dist[v]
    )[[/dj.pick]]

    [[dj.neighbors]]for v, w in graph[u]:[[/dj.neighbors]]
      [[dj.check.visited]]if v in visited:[[/dj.check.visited]]
        [[dj.check.visited]]continue[[/dj.check.visited]]
      [[dj.relax]]if dist[u] + w < dist[v]:[[/dj.relax]]
        [[dj.update]]dist[v] = dist[u] + w[[/dj.update]]
        [[dj.update]]prev[v] = u[[/dj.update]]

    [[dj.visit]]visited.add(u)[[/dj.visit]]

  [[dj.done]]return dist, prev[[/dj.done]]
`;

export const DIJKSTRA_PY_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PY_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
