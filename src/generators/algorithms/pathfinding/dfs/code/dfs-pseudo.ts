export const DFS_PSEUDO =
`function dfs(grid, rows, cols, sr, sc):
   [[dfs.init.stack]]stack = new Stack()[[/dfs.init.stack]]
   [[dfs.init.visited]]visited = array(rows, cols, false)[[/dfs.init.visited]]
   [[dfs.init.order]]order = array(rows, cols, -1)[[/dfs.init.order]]
   [[dfs.init.mark]]visited[sr][sc] = true[[/dfs.init.mark]]
   [[dfs.init.setorder]]order[sr][sc] = 1[[/dfs.init.setorder]]
   [[dfs.init.push]]stack.push((sr, sc))[[/dfs.init.push]]

   [[dfs.loop]]while stack is not empty:[[/dfs.loop]]
     [[dfs.pop]](row, col) = stack.pop()[[/dfs.pop]]

     [[dfs.check]]for (dr, dc) in [UP, RIGHT, DOWN, LEFT]:[[/dfs.check]]
       [[dfs.check]]nrow, ncol = row + dr, col + dc[[/dfs.check]]

       [[dfs.oob]]if out of bounds: continue[[/dfs.oob]]
       [[dfs.wall]]if grid[nrow][ncol] is wall: continue[[/dfs.wall]]
       [[dfs.visited]]if visited[nrow][ncol]: continue[[/dfs.visited]]

       [[dfs.mark]]visited[nrow][ncol] = true[[/dfs.mark]]
       [[dfs.setorder]]order[nrow][ncol] = next order[[/dfs.setorder]]
       [[dfs.push]]stack.push((nrow, ncol))[[/dfs.push]]

   [[dfs.done]]return order[[/dfs.done]]
`;

export const DFS_PSEUDO_POINTER_HINTS = {
  "dfs.pop": ["cur"],
  "dfs.check": ["cur"],
  "dfs.oob": ["cur"],
  "dfs.wall": ["cur", "nb"],
  "dfs.visited": ["cur", "nb"],
  "dfs.mark": ["cur", "nb"],
  "dfs.setorder": ["cur", "nb"],
  "dfs.push": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const DFS_PSEUDO_POINTER_LABELS = {
  cur: "(row,col)",
  nb: "(nrow,ncol)",
} as const satisfies Record<string, string>;
