export const BFS_CPP =
` [[bfs.init]]void bfs(vector<vector<int>>& adj, int src) {[[/bfs.init]]
   [[bfs.init]]vector<bool> visited(n, false);[[/bfs.init]]
   [[bfs.init]]vector<int> level(n, -1);[[/bfs.init]]
   [[bfs.init]]queue<int> q;[[/bfs.init]]
   [[bfs.init]]visited[src] = true;[[/bfs.init]]
   [[bfs.init]]level[src] = 0;[[/bfs.init]]
   [[bfs.init]]q.push(src);[[/bfs.init]]

   [[bfs.dequeue]]while (!q.empty()) {[[/bfs.dequeue]]
     [[bfs.dequeue]]int u = q.front(); q.pop();[[/bfs.dequeue]]

     [[bfs.explore]]for (int v : adj[u]) {[[/bfs.explore]]
       [[bfs.explore]]if (!visited[v]) {[[/bfs.explore]]
         [[bfs.discover]]visited[v] = true;[[/bfs.discover]]
         [[bfs.discover]]level[v] = level[u] + 1;[[/bfs.discover]]
         [[bfs.discover]]q.push(v);[[/bfs.discover]]
       }
     }
   }

   [[bfs.done]]// level[] is populated[[/bfs.done]]
 }`;

export const BFS_CPP_POINTER_HINTS = {
  "bfs.dequeue": ["u"],
  "bfs.explore": ["u", "v"],
  "bfs.discover": ["u", "v"],
  "bfs.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BFS_CPP_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
