export const DIJKSTRA_JAVA =
` [[dj.init]]void dijkstra(int[][] graph, int src) {[[/dj.init]]
   [[dj.init]]int[] dist = new int[n];[[/dj.init]]
   [[dj.init]]int[] prev = new int[n];[[/dj.init]]
   [[dj.init]]boolean[] visited = new boolean[n];[[/dj.init]]
   [[dj.init]]Arrays.fill(dist, Integer.MAX_VALUE);[[/dj.init]]
   [[dj.init]]dist[src] = 0;[[/dj.init]]

   [[dj.pick]]for (int i = 0; i < n; i++) {[[/dj.pick]]
     [[dj.pick]]int u = minDist(dist, visited);[[/dj.pick]]

     [[dj.relax]]for (int[] edge : adj[u]) {[[/dj.relax]]
       [[dj.relax]]int v = edge[0], w = edge[1];[[/dj.relax]]
       [[dj.relax]]if (dist[u] + w < dist[v]) {[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w;[[/dj.update]]
         [[dj.update]]prev[v] = u;[[/dj.update]]
       }
     }

     [[dj.visit]]visited[u] = true;[[/dj.visit]]
   }

   [[dj.done]]// dist[] and prev[] are populated[[/dj.done]]
 }`;

export const DIJKSTRA_JAVA_POINTER_HINTS = {
  "dj.pick": ["u"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_JAVA_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
