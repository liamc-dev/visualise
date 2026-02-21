export const DIJKSTRA_JS =
` [[dj.init]]function dijkstra(graph, source) {[[/dj.init]]
   [[dj.init]]const dist = {};[[/dj.init]]
   [[dj.init]]const prev = {};[[/dj.init]]
   [[dj.init]]const visited = new Set();[[/dj.init]]
   [[dj.init]]for (const v of graph.nodes) dist[v] = Infinity;[[/dj.init]]
   [[dj.init]]dist[source] = 0;[[/dj.init]]

   [[dj.pick]]while (visited.size < graph.nodes.length) {[[/dj.pick]]
     [[dj.pick]]const u = minDist(dist, visited);[[/dj.pick]]

     [[dj.relax]]for (const { to: v, weight: w } of adj[u]) {[[/dj.relax]]
       [[dj.relax]]if (dist[u] + w < dist[v]) {[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w;[[/dj.update]]
         [[dj.update]]prev[v] = u;[[/dj.update]]
       }
     }

     [[dj.visit]]visited.add(u);[[/dj.visit]]
   }

   [[dj.done]]return { dist, prev };[[/dj.done]]
 }`;

export const DIJKSTRA_JS_POINTER_HINTS = {
  "dj.pick": ["u"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_JS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
