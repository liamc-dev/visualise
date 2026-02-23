export const ASTAR_JAVA =
`// grid[r][c] = cost to enter cell (0 = wall)
// h(r,c) = Manhattan distance to goal
public class AStar {
  static int[][] DIRS = {{0,1},{1,0},{0,-1},{-1,0}};

  static int[] minFCell(
      int[][] f, boolean[][] visited,
      int rows, int cols) {
    int r = -1, c = -1, best = Integer.MAX_VALUE;
    for (int ri = 0; ri < rows; ri++)
      for (int ci = 0; ci < cols; ci++)
        if (!visited[ri][ci] && f[ri][ci] < best)
          { r = ri; c = ci; best = f[ri][ci]; }
    return new int[]{r, c};
  }


  public static int[][] aStar(
      int[][] grid, int sr, int sc,
      int gr, int gc) {
    int rows = grid.length;
    int cols = grid[0].length;

    [[as.init.g]]int[][] g = new int[rows][cols];[[/as.init.g]]
    [[as.init.g]]for (int[] row : g)[[/as.init.g]]
      [[as.init.g]]Arrays.fill(row, Integer.MAX_VALUE);[[/as.init.g]]
    [[as.init.f]]int[][] f = new int[rows][cols];[[/as.init.f]]
    [[as.init.f]]for (int[] row : f)[[/as.init.f]]
      [[as.init.f]]Arrays.fill(row, Integer.MAX_VALUE);[[/as.init.f]]
    [[as.init.visited]]boolean[][] visited = new boolean[rows][cols];[[/as.init.visited]]
    [[as.init.setg]]g[sr][sc] = 0;[[/as.init.setg]]
    [[as.init.setg]]f[sr][sc] = Math.abs(sr - gr) + Math.abs(sc - gc);[[/as.init.setg]]

    [[as.loop]]for (int i = 0; i < rows * cols; i++) {[[/as.loop]]
      [[as.pick]]int[] rc = minFCell(f, visited, rows, cols);[[/as.pick]]
      [[as.pick]]int r = rc[0], c = rc[1];[[/as.pick]]
      [[as.pick]]if (f[r][c] == Integer.MAX_VALUE) break;[[/as.pick]]

      [[as.goal]]if (r == gr && c == gc) break;[[/as.goal]]

      [[as.neighbors]]for (int[] d : DIRS) {[[/as.neighbors]]
        [[as.neighbors]]int nr = r + d[0], nc = c + d[1];[[/as.neighbors]]
        if (nr < 0 || nr >= rows ||
            nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] == 0) continue;

        [[as.check.visited]]if (visited[nr][nc]) continue;[[/as.check.visited]]

        [[as.relax]]int tentG = g[r][c] + grid[nr][nc];[[/as.relax]]
        [[as.relax]]if (tentG < g[nr][nc]) {[[/as.relax]]
          [[as.update]]g[nr][nc] = tentG;[[/as.update]]
          [[as.update]]f[nr][nc] = tentG + Math.abs(nr - gr)[[/as.update]]
            [[as.update]]+ Math.abs(nc - gc);[[/as.update]]
        }
      }

      [[as.visit]]visited[r][c] = true;[[/as.visit]]
    }

    [[as.done]]return g;[[/as.done]]
  }
}`;

export const ASTAR_JAVA_POINTER_HINTS = {
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

export const ASTAR_JAVA_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
