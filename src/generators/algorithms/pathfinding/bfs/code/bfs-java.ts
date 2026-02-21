export const BFS_JAVA =
`public class BFS {
  private static final int[][] DIRS = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

  public static int[][] bfs(int[][] grid, int sr, int sc) {
    int rows = grid.length;
    int cols = grid[0].length;

    [[bfs.init.queue]]Queue<int[]> queue = new LinkedList<>();[[/bfs.init.queue]]
    [[bfs.init.visited]]boolean[][] visited = new boolean[rows][cols];[[/bfs.init.visited]]
    [[bfs.init.level]]int[][] level = new int[rows][cols];[[/bfs.init.level]]
    [[bfs.init.level]]for (int[] row : level) Arrays.fill(row, -1);[[/bfs.init.level]]
    [[bfs.init.mark]]visited[sr][sc] = true;[[/bfs.init.mark]]
    [[bfs.init.setlevel]]level[sr][sc] = 0;[[/bfs.init.setlevel]]
    [[bfs.init.enqueue]]queue.add(new int[]{sr, sc});[[/bfs.init.enqueue]]

    [[bfs.loop]]while (!queue.isEmpty()) {[[/bfs.loop]]
      [[bfs.dequeue]]int[] cell = queue.poll();[[/bfs.dequeue]]
      [[bfs.dequeue]]int r = cell[0], c = cell[1];[[/bfs.dequeue]]

      [[bfs.check]]for (int[] d : DIRS) {[[/bfs.check]]
        [[bfs.check]]int nr = r + d[0];[[/bfs.check]]
        [[bfs.check]]int nc = c + d[1];[[/bfs.check]]

        [[bfs.oob]]if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {[[/bfs.oob]]
          [[bfs.oob]]continue;[[/bfs.oob]]
        [[bfs.oob]]}[[/bfs.oob]]
        [[bfs.wall]]if (grid[nr][nc] == 1) {[[/bfs.wall]]
          [[bfs.wall]]continue;[[/bfs.wall]]
        [[bfs.wall]]}[[/bfs.wall]]
        [[bfs.visited]]if (visited[nr][nc]) {[[/bfs.visited]]
          [[bfs.visited]]continue;[[/bfs.visited]]
        [[bfs.visited]]}[[/bfs.visited]]

        [[bfs.mark]]visited[nr][nc] = true;[[/bfs.mark]]
        [[bfs.setlevel]]level[nr][nc] = level[r][c] + 1;[[/bfs.setlevel]]
        [[bfs.enqueue]]queue.add(new int[]{nr, nc});[[/bfs.enqueue]]
      }
    }

    [[bfs.done]]return level;[[/bfs.done]]
  }
}`;

export const BFS_JAVA_POINTER_HINTS = {
  "bfs.dequeue": ["cur"],
  "bfs.check": ["cur"],
  "bfs.oob": ["cur"],
  "bfs.wall": ["cur", "nb"],
  "bfs.visited": ["cur", "nb"],
  "bfs.mark": ["cur", "nb"],
  "bfs.setlevel": ["cur", "nb"],
  "bfs.enqueue": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const BFS_JAVA_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
