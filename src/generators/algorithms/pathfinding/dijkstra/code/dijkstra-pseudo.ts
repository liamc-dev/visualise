export const DIJKSTRA_PSEUDO =
`// grid[r][c] = cost to enter cell (0 = wall)

function minDistCell(dist, visited, rows, cols):
   r, c, best = -1, -1, \u221e
   for i in 0..rows:
     for j in 0..cols:
       if not visited[i][j] and dist[i][j] < best:
         r, c, best = i, j, dist[i][j]
   return (r, c)


function dijkstra(grid, rows, cols, sr, sc):
   [[dj.init.dist]]dist = array(rows, cols, \u221e)[[/dj.init.dist]]
   [[dj.init.visited]]visited = array(rows, cols, false)[[/dj.init.visited]]
   [[dj.init.setdist]]dist[sr][sc] = 0[[/dj.init.setdist]]

   [[dj.loop]]for i in 0..rows*cols:[[/dj.loop]]
     [[dj.pick]](r, c) = minDistCell(dist, visited, rows, cols)[[/dj.pick]]
     [[dj.pick]]if dist[r][c] == \u221e: break[[/dj.pick]]

     [[dj.neighbors]]for (dr, dc) in [UP, RIGHT, DOWN, LEFT]:[[/dj.neighbors]]
       [[dj.neighbors]]nr, nc = r + dr, c + dc[[/dj.neighbors]]
       skip if out of bounds or wall

       [[dj.check.visited]]if visited[nr][nc]: continue[[/dj.check.visited]]

       [[dj.relax]]tentative = dist[r][c] + grid[nr][nc][[/dj.relax]]
       [[dj.relax]]if tentative < dist[nr][nc]:[[/dj.relax]]
         [[dj.update]]dist[nr][nc] = tentative[[/dj.update]]

     [[dj.visit]]visited[r][c] = true[[/dj.visit]]

   [[dj.done]]return dist[[/dj.done]]
`;

export const DIJKSTRA_PSEUDO_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PSEUDO_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
