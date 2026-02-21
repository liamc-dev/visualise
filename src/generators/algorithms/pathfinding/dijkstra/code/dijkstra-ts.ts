export const DIJKSTRA_TS =
`const dirs: [number, number][] = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function dijkstra(graph: Graph, source: string): { dist: Record<string, number>; prev: Record<string, string | null> } {
  const nodes = graph.nodes;
  const n = nodes.length;

  [[dj.init.dist]]const dist: Record<string, number> = {};[[/dj.init.dist]]
  [[dj.init.dist]]for (const v of nodes) {[[/dj.init.dist]]
    [[dj.init.dist]]dist[v] = Infinity;[[/dj.init.dist]]
  [[dj.init.dist]]}[[/dj.init.dist]]
  [[dj.init.prev]]const prev: Record<string, string | null> = {};[[/dj.init.prev]]
  [[dj.init.visited]]const visited = new Set<string>();[[/dj.init.visited]]
  [[dj.init.setdist]]dist[source] = 0;[[/dj.init.setdist]]

  [[dj.loop]]while (visited.size < n) {[[/dj.loop]]
    [[dj.pick]]const u = minDist(dist, visited);[[/dj.pick]]

    [[dj.neighbors]]for (const { to: v, weight: w } of adj[u]) {[[/dj.neighbors]]
      [[dj.check.visited]]if (visited.has(v)) {[[/dj.check.visited]]
        [[dj.check.visited]]continue;[[/dj.check.visited]]
      [[dj.check.visited]]}[[/dj.check.visited]]
      [[dj.relax]]if (dist[u] + w < dist[v]) {[[/dj.relax]]
        [[dj.update]]dist[v] = dist[u] + w;[[/dj.update]]
        [[dj.update]]prev[v] = u;[[/dj.update]]
      }
    }

    [[dj.visit]]visited.add(u);[[/dj.visit]]
  }

  [[dj.done]]return { dist, prev };[[/dj.done]]
}`;

export const DIJKSTRA_TS_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_TS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
