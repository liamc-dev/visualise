export const BFS_PSEUDO =
`function bfs(grid, rows, cols, sr, sc):
   [[bfs.init.queue]]queue = new Queue()[[/bfs.init.queue]]
   [[bfs.init.visited]]visited = array(rows, cols, false)[[/bfs.init.visited]]
   [[bfs.init.level]]level = array(rows, cols, -1)[[/bfs.init.level]]
   [[bfs.init.mark]]visited[sr][sc] = true[[/bfs.init.mark]]
   [[bfs.init.setlevel]]level[sr][sc] = 0[[/bfs.init.setlevel]]
   [[bfs.init.enqueue]]queue.enqueue((sr, sc))[[/bfs.init.enqueue]]

   [[bfs.loop]]while queue is not empty:[[/bfs.loop]]
     [[bfs.dequeue]](row, col) = queue.dequeue()[[/bfs.dequeue]]

     [[bfs.check]]for (dr, dc) in [UP, RIGHT, DOWN, LEFT]:[[/bfs.check]]
       [[bfs.check]]nrow, ncol = row + dr, col + dc[[/bfs.check]]

       [[bfs.oob]]if out of bounds: continue[[/bfs.oob]]
       [[bfs.wall]]if grid[nrow][ncol] is wall: continue[[/bfs.wall]]
       [[bfs.visited]]if visited[nrow][ncol]: continue[[/bfs.visited]]

       [[bfs.mark]]visited[nrow][ncol] = true[[/bfs.mark]]
       [[bfs.setlevel]]level[nrow][ncol] = level[row][col] + 1[[/bfs.setlevel]]
       [[bfs.enqueue]]queue.enqueue((nrow, ncol))[[/bfs.enqueue]]

   [[bfs.done]]return level[[/bfs.done]]
`;

export const BFS_PSEUDO_POINTER_HINTS = {
  "bfs.dequeue": ["cur"],
  "bfs.check": ["cur"],
  "bfs.oob": ["cur"],
  "bfs.wall": ["cur", "nb"],
  "bfs.visited": ["cur", "nb"],
  "bfs.mark": ["cur", "nb"],
  "bfs.setlevel": ["cur", "nb"],
  "bfs.enqueue": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const BFS_PSEUDO_POINTER_LABELS = {
  cur: "(row,col)",
  nb: "(nrow,ncol)",
} as const satisfies Record<string, string>;
