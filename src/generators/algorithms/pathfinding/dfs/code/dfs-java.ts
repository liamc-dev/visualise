export const DFS_JAVA =
`public class DFS {
  private static final int[][] DIRS = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

  public static int[][] dfs(int[][] grid, int sr, int sc) {
    int rows = grid.length;
    int cols = grid[0].length;

    [[dfs.init.stack]]Deque<int[]> stack = new ArrayDeque<>();[[/dfs.init.stack]]
    [[dfs.init.visited]]boolean[][] visited = new boolean[rows][cols];[[/dfs.init.visited]]
    [[dfs.init.order]]int[][] order = new int[rows][cols];[[/dfs.init.order]]
    [[dfs.init.order]]for (int[] row : order) Arrays.fill(row, -1);[[/dfs.init.order]]
    int[] count = {0};
    [[dfs.init.mark]]visited[sr][sc] = true;[[/dfs.init.mark]]
    [[dfs.init.setorder]]order[sr][sc] = ++count[0];[[/dfs.init.setorder]]
    [[dfs.init.push]]stack.push(new int[]{sr, sc});[[/dfs.init.push]]

    [[dfs.loop]]while (!stack.isEmpty()) {[[/dfs.loop]]
      [[dfs.pop]]int[] cell = stack.pop();[[/dfs.pop]]
      [[dfs.pop]]int r = cell[0], c = cell[1];[[/dfs.pop]]

      [[dfs.check]]for (int[] d : DIRS) {[[/dfs.check]]
        [[dfs.check]]int nr = r + d[0];[[/dfs.check]]
        [[dfs.check]]int nc = c + d[1];[[/dfs.check]]

        [[dfs.oob]]if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {[[/dfs.oob]]
          [[dfs.oob]]continue;[[/dfs.oob]]
        [[dfs.oob]]}[[/dfs.oob]]
        [[dfs.wall]]if (grid[nr][nc] == 1) {[[/dfs.wall]]
          [[dfs.wall]]continue;[[/dfs.wall]]
        [[dfs.wall]]}[[/dfs.wall]]
        [[dfs.visited]]if (visited[nr][nc]) {[[/dfs.visited]]
          [[dfs.visited]]continue;[[/dfs.visited]]
        [[dfs.visited]]}[[/dfs.visited]]

        [[dfs.mark]]visited[nr][nc] = true;[[/dfs.mark]]
        [[dfs.setorder]]order[nr][nc] = ++count[0];[[/dfs.setorder]]
        [[dfs.push]]stack.push(new int[]{nr, nc});[[/dfs.push]]
      }
    }

    [[dfs.done]]return order;[[/dfs.done]]
  }
}`;

export const DFS_JAVA_POINTER_HINTS = {
  "dfs.pop": ["cur"],
  "dfs.check": ["cur"],
  "dfs.oob": ["cur"],
  "dfs.wall": ["cur", "nb"],
  "dfs.visited": ["cur", "nb"],
  "dfs.mark": ["cur", "nb"],
  "dfs.setorder": ["cur", "nb"],
  "dfs.push": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const DFS_JAVA_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
