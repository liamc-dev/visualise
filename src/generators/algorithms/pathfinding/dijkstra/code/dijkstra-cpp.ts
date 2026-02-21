export const DIJKSTRA_CPP =
` [[dj.init]]void dijkstra(vector<vector<pair<int,int>>>& adj, int src) {[[/dj.init]]
   [[dj.init]]vector<int> dist(n, INT_MAX);[[/dj.init]]
   [[dj.init]]vector<int> prev(n, -1);[[/dj.init]]
   [[dj.init]]vector<bool> visited(n, false);[[/dj.init]]
   [[dj.init]]dist[src] = 0;[[/dj.init]]

   [[dj.pick]]for (int i = 0; i < n; i++) {[[/dj.pick]]
     [[dj.pick]]int u = minDist(dist, visited);[[/dj.pick]]

     [[dj.relax]]for (auto& [v, w] : adj[u]) {[[/dj.relax]]
       [[dj.relax]]if (dist[u] + w < dist[v]) {[[/dj.relax]]
         [[dj.update]]dist[v] = dist[u] + w;[[/dj.update]]
         [[dj.update]]prev[v] = u;[[/dj.update]]
       }
     }

     [[dj.visit]]visited[u] = true;[[/dj.visit]]
   }

   [[dj.done]]// dist[] and prev[] are populated[[/dj.done]]
 }`;

export const DIJKSTRA_CPP_POINTER_HINTS = {
  "dj.pick": ["u"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_CPP_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
