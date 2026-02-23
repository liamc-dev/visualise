export const ASTAR_PY =
`# grid[r][c] = cost to enter cell (0 = wall)
# h(r,c) = Manhattan distance to goal
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]

def min_f_cell(f, visited, rows, cols):
  r, c, best = -1, -1, float('inf')
  for i in range(rows):
    for j in range(cols):
      if not visited[i][j] and f[i][j] < best:
        r, c, best = i, j, f[i][j]
  return r, c


def a_star(grid, sr, sc, gr, gc):
  rows = len(grid)
  cols = len(grid[0])
  h = lambda r, c: abs(r - gr) + abs(c - gc)

  [[as.init.g]]g = [ [float('inf')] * cols for _ in range(rows) ][[/as.init.g]]
  [[as.init.f]]f = [ [float('inf')] * cols for _ in range(rows) ][[/as.init.f]]
  [[as.init.visited]]visited = [ [False] * cols for _ in range(rows) ][[/as.init.visited]]
  [[as.init.setg]]g[sr][sc] = 0[[/as.init.setg]]
  [[as.init.setg]]f[sr][sc] = h(sr, sc)[[/as.init.setg]]

  [[as.loop]]for _ in range(rows * cols):[[/as.loop]]
    [[as.pick]]r, c = min_f_cell(f, visited, rows, cols)[[/as.pick]]
    [[as.pick]]if f[r][c] == float('inf'):[[/as.pick]]
      [[as.pick]]break[[/as.pick]]

    [[as.goal]]if r == gr and c == gc:[[/as.goal]]
      [[as.goal]]break[[/as.goal]]

    [[as.neighbors]]for dr, dc in DIRS:[[/as.neighbors]]
      [[as.neighbors]]nr, nc = r + dr, c + dc[[/as.neighbors]]
      if nr < 0 or nr >= rows or nc < 0 or nc >= cols:
        continue
      if grid[nr][nc] == 0:
        continue

      [[as.check.visited]]if visited[nr][nc]:[[/as.check.visited]]
        [[as.check.visited]]continue[[/as.check.visited]]

      [[as.relax]]tent_g = g[r][c] + grid[nr][nc][[/as.relax]]
      [[as.relax]]if tent_g < g[nr][nc]:[[/as.relax]]
        [[as.update]]g[nr][nc] = tent_g[[/as.update]]
        [[as.update]]f[nr][nc] = tent_g + h(nr, nc)[[/as.update]]

    [[as.visit]]visited[r][c] = True[[/as.visit]]

  [[as.done]]return g[[/as.done]]
`;

export const ASTAR_PY_POINTER_HINTS = {
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

export const ASTAR_PY_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
