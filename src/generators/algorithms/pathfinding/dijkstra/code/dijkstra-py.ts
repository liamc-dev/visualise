export const DIJKSTRA_PY =
`# grid[r][c] = cost to enter cell (0 = wall)
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]

def min_dist_cell(dist, visited, rows, cols):
  r, c, best = -1, -1, float('inf')
  for i in range(rows):
    for j in range(cols):
      if not visited[i][j] and dist[i][j] < best:
        r, c, best = i, j, dist[i][j]
  return r, c


def dijkstra(grid, sr, sc):
  rows = len(grid)
  cols = len(grid[0])

  [[dj.init.dist]]dist = [ [float('inf')] * cols for _ in range(rows) ][[/dj.init.dist]]
  [[dj.init.visited]]visited = [ [False] * cols for _ in range(rows) ][[/dj.init.visited]]
  [[dj.init.setdist]]dist[sr][sc] = 0[[/dj.init.setdist]]

  [[dj.loop]]for _ in range(rows * cols):[[/dj.loop]]
    [[dj.pick]]r, c = min_dist_cell(dist, visited, rows, cols)[[/dj.pick]]
    [[dj.pick]]if dist[r][c] == float('inf'):[[/dj.pick]]
      [[dj.pick]]break[[/dj.pick]]

    [[dj.neighbors]]for dr, dc in DIRS:[[/dj.neighbors]]
      [[dj.neighbors]]nr, nc = r + dr, c + dc[[/dj.neighbors]]
      if nr < 0 or nr >= rows or nc < 0 or nc >= cols:
        continue
      if grid[nr][nc] == 0:
        continue

      [[dj.check.visited]]if visited[nr][nc]:[[/dj.check.visited]]
        [[dj.check.visited]]continue[[/dj.check.visited]]

      [[dj.relax]]tentative = dist[r][c] + grid[nr][nc][[/dj.relax]]
      [[dj.relax]]if tentative < dist[nr][nc]:[[/dj.relax]]
        [[dj.update]]dist[nr][nc] = tentative[[/dj.update]]

    [[dj.visit]]visited[r][c] = True[[/dj.visit]]

  [[dj.done]]return dist[[/dj.done]]
`;

export const DIJKSTRA_PY_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_PY_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
