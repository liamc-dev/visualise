export const BFS_TS =
` [[bfs.init]]function bfs(graph: Graph, source: string) {[[/bfs.init]]
   [[bfs.init]]const visited = new Set<string>([source]);[[/bfs.init]]
   [[bfs.init]]const queue: string[] = [source];[[/bfs.init]]
   [[bfs.init]]const level: Record<string, number> = { [source]: 0 };[[/bfs.init]]

   [[bfs.dequeue]]while (queue.length > 0) {[[/bfs.dequeue]]
     [[bfs.dequeue]]const u = queue.shift()!;[[/bfs.dequeue]]

     [[bfs.explore]]for (const v of adj[u]) {[[/bfs.explore]]
       [[bfs.explore]]if (!visited.has(v)) {[[/bfs.explore]]
         [[bfs.discover]]visited.add(v);[[/bfs.discover]]
         [[bfs.discover]]level[v] = level[u] + 1;[[/bfs.discover]]
         [[bfs.discover]]queue.push(v);[[/bfs.discover]]
       }
     }
   }

   [[bfs.done]]return level;[[/bfs.done]]
 }`;

export const BFS_TS_POINTER_HINTS = {
  "bfs.dequeue": ["u"],
  "bfs.explore": ["u", "v"],
  "bfs.discover": ["u", "v"],
  "bfs.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BFS_TS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
