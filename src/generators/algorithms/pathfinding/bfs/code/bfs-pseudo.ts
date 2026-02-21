export const BFS_PSEUDO =
` [[bfs.init]]function bfs(graph, source):[[/bfs.init]]
   [[bfs.init]]visited = {source}[[/bfs.init]]
   [[bfs.init]]queue = [source][[/bfs.init]]
   [[bfs.init]]level = {source: 0}[[/bfs.init]]

   [[bfs.dequeue]]while queue is not empty:[[/bfs.dequeue]]
     [[bfs.dequeue]]u = queue.dequeue()[[/bfs.dequeue]]

     [[bfs.explore]]for each neighbor v of u:[[/bfs.explore]]
       [[bfs.explore]]if v not in visited:[[/bfs.explore]]
         [[bfs.discover]]visited.add(v)[[/bfs.discover]]
         [[bfs.discover]]level[v] = level[u] + 1[[/bfs.discover]]
         [[bfs.discover]]queue.enqueue(v)[[/bfs.discover]]

   [[bfs.done]]return level[[/bfs.done]]
`;

export const BFS_PSEUDO_POINTER_HINTS = {
  "bfs.dequeue": ["u"],
  "bfs.explore": ["u", "v"],
  "bfs.discover": ["u", "v"],
  "bfs.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BFS_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
