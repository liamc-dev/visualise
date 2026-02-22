export const DFS_PY =
`dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]

def dfs(grid, sr, sc):
  rows = len(grid)
  cols = len(grid[0])

  [[dfs.init.stack]]stack = [][[/dfs.init.stack]]
  [[dfs.init.visited]]visited = [ [False] * cols for _ in range(rows) ][[/dfs.init.visited]]
  [[dfs.init.order]]order = [ [-1] * cols for _ in range(rows) ][[/dfs.init.order]]
  count = 0
  [[dfs.init.mark]]visited[sr][sc] = True[[/dfs.init.mark]]
  [[dfs.init.setorder]]count += 1; order[sr][sc] = count[[/dfs.init.setorder]]
  [[dfs.init.push]]stack.append((sr, sc))[[/dfs.init.push]]

  [[dfs.loop]]while stack:[[/dfs.loop]]
    [[dfs.pop]]r, c = stack.pop()[[/dfs.pop]]

    [[dfs.check]]for dr, dc in dirs:[[/dfs.check]]
      [[dfs.check]]nr, nc = r + dr, c + dc[[/dfs.check]]

      [[dfs.oob]]if nr < 0 or nr >= rows or nc < 0 or nc >= cols:[[/dfs.oob]]
        [[dfs.oob]]continue[[/dfs.oob]]
      [[dfs.wall]]if grid[nr][nc] == 1:[[/dfs.wall]]
        [[dfs.wall]]continue[[/dfs.wall]]
      [[dfs.visited]]if visited[nr][nc]:[[/dfs.visited]]
        [[dfs.visited]]continue[[/dfs.visited]]

      [[dfs.mark]]visited[nr][nc] = True[[/dfs.mark]]
      [[dfs.setorder]]count += 1; order[nr][nc] = count[[/dfs.setorder]]
      [[dfs.push]]stack.append((nr, nc))[[/dfs.push]]

  [[dfs.done]]return order[[/dfs.done]]
`;

export const DFS_PY_POINTER_HINTS = {
  "dfs.pop": ["cur"],
  "dfs.check": ["cur"],
  "dfs.oob": ["cur"],
  "dfs.wall": ["cur", "nb"],
  "dfs.visited": ["cur", "nb"],
  "dfs.mark": ["cur", "nb"],
  "dfs.setorder": ["cur", "nb"],
  "dfs.push": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const DFS_PY_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
