export const BFS_PY =
`dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]

def bfs(grid, sr, sc):
  rows = len(grid)
  cols = len(grid[0])

  [[bfs.init.queue]]queue = deque()[[/bfs.init.queue]]
  [[bfs.init.visited]]visited = [ [False] * cols for _ in range(rows) ][[/bfs.init.visited]]
  [[bfs.init.level]]level = [ [-1] * cols for _ in range(rows) ][[/bfs.init.level]]
  [[bfs.init.mark]]visited[sr][sc] = True[[/bfs.init.mark]]
  [[bfs.init.setlevel]]level[sr][sc] = 0[[/bfs.init.setlevel]]
  [[bfs.init.enqueue]]queue.append((sr, sc))[[/bfs.init.enqueue]]

  [[bfs.loop]]while queue:[[/bfs.loop]]
    [[bfs.dequeue]]r, c = queue.popleft()[[/bfs.dequeue]]

    [[bfs.check]]for dr, dc in dirs:[[/bfs.check]]
      [[bfs.check]]nr, nc = r + dr, c + dc[[/bfs.check]]

      [[bfs.oob]]if nr < 0 or nr >= rows or nc < 0 or nc >= cols:[[/bfs.oob]]
        [[bfs.oob]]continue[[/bfs.oob]]
      [[bfs.wall]]if grid[nr][nc] == 1:[[/bfs.wall]]
        [[bfs.wall]]continue[[/bfs.wall]]
      [[bfs.visited]]if visited[nr][nc]:[[/bfs.visited]]
        [[bfs.visited]]continue[[/bfs.visited]]

      [[bfs.mark]]visited[nr][nc] = True[[/bfs.mark]]
      [[bfs.setlevel]]level[nr][nc] = level[r][c] + 1[[/bfs.setlevel]]
      [[bfs.enqueue]]queue.append((nr, nc))[[/bfs.enqueue]]

  [[bfs.done]]return level[[/bfs.done]]
`;

export const BFS_PY_POINTER_HINTS = {
  "bfs.dequeue": ["cur"],
  "bfs.check": ["cur"],
  "bfs.oob": ["cur"],
  "bfs.wall": ["cur", "nb"],
  "bfs.visited": ["cur", "nb"],
  "bfs.mark": ["cur", "nb"],
  "bfs.setlevel": ["cur", "nb"],
  "bfs.enqueue": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const BFS_PY_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
