export const ASTAR_PSEUDO =
`// grid[r][c] = cost to enter cell (0 = wall)
// h(r,c) = |r - goalRow| + |c - goalCol|  (Manhattan)

function minFCell(f, visited, rows, cols):
   r, c, best = -1, -1, \u221e
   for i in 0..rows:
     for j in 0..cols:
       if not visited[i][j] and f[i][j] < best:
         r, c, best = i, j, f[i][j]
   return (r, c)


function aStar(grid, rows, cols, sr, sc, gr, gc):
   [[as.init.g]]g = array(rows, cols, \u221e)[[/as.init.g]]
   [[as.init.f]]f = array(rows, cols, \u221e)[[/as.init.f]]
   [[as.init.visited]]visited = array(rows, cols, false)[[/as.init.visited]]
   [[as.init.setg]]g[sr][sc] = 0[[/as.init.setg]]
   [[as.init.setg]]f[sr][sc] = h(sr, sc)[[/as.init.setg]]

   [[as.loop]]for i in 0..rows*cols:[[/as.loop]]
     [[as.pick]](r, c) = minFCell(f, visited, rows, cols)[[/as.pick]]
     [[as.pick]]if f[r][c] == \u221e: break[[/as.pick]]

     [[as.goal]]if (r, c) == (gr, gc): break[[/as.goal]]

     [[as.neighbors]]for (dr, dc) in [UP, RIGHT, DOWN, LEFT]:[[/as.neighbors]]
       [[as.neighbors]]nr, nc = r + dr, c + dc[[/as.neighbors]]
       skip if out of bounds or wall

       [[as.check.visited]]if visited[nr][nc]: continue[[/as.check.visited]]

       [[as.relax]]tentG = g[r][c] + grid[nr][nc][[/as.relax]]
       [[as.relax]]if tentG < g[nr][nc]:[[/as.relax]]
         [[as.update]]g[nr][nc] = tentG[[/as.update]]
         [[as.update]]f[nr][nc] = tentG + h(nr, nc)[[/as.update]]

     [[as.visit]]visited[r][c] = true[[/as.visit]]

   [[as.done]]return g, f  // reconstruct path via prev[[/as.done]]
`;

export const ASTAR_PSEUDO_POINTER_HINTS = {
  "as.loop": ["u"],
  "as.pick": ["u"],
  "as.goal": ["u"],
  "as.neighbors": ["u", "v"],
  "as.check.visited": ["u", "v"],
  "as.relax": ["u", "v"],
  "as.update": ["u", "v"],
  "as.skip": ["u", "v"],
  "as.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const ASTAR_PSEUDO_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
