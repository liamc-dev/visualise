export const BFS_JAVA =
` [[bfs.init]]void bfs(List<List<Integer>> adj, int src) {[[/bfs.init]]
   [[bfs.init]]boolean[] visited = new boolean[n];[[/bfs.init]]
   [[bfs.init]]int[] level = new int[n];[[/bfs.init]]
   [[bfs.init]]Arrays.fill(level, -1);[[/bfs.init]]
   [[bfs.init]]Queue<Integer> queue = new LinkedList<>();[[/bfs.init]]
   [[bfs.init]]visited[src] = true;[[/bfs.init]]
   [[bfs.init]]level[src] = 0;[[/bfs.init]]
   [[bfs.init]]queue.add(src);[[/bfs.init]]

   [[bfs.dequeue]]while (!queue.isEmpty()) {[[/bfs.dequeue]]
     [[bfs.dequeue]]int u = queue.poll();[[/bfs.dequeue]]

     [[bfs.explore]]for (int v : adj.get(u)) {[[/bfs.explore]]
       [[bfs.explore]]if (!visited[v]) {[[/bfs.explore]]
         [[bfs.discover]]visited[v] = true;[[/bfs.discover]]
         [[bfs.discover]]level[v] = level[u] + 1;[[/bfs.discover]]
         [[bfs.discover]]queue.add(v);[[/bfs.discover]]
       }
     }
   }

   [[bfs.done]]// level[] is populated[[/bfs.done]]
 }`;

export const BFS_JAVA_POINTER_HINTS = {
  "bfs.dequeue": ["u"],
  "bfs.explore": ["u", "v"],
  "bfs.discover": ["u", "v"],
  "bfs.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BFS_JAVA_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
