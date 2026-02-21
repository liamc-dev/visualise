export const DIJKSTRA_JAVA =
`// grid[r][c] = cost to enter cell (0 = wall)
public class Dijkstra {
  static int[][] DIRS = {{0,1},{1,0},{0,-1},{-1,0}};

  static int[] minDistCell(
      int[][] dist, boolean[][] visited,
      int rows, int cols) {
    int r = -1, c = -1, best = Integer.MAX_VALUE;
    for (int ri = 0; ri < rows; ri++)
      for (int ci = 0; ci < cols; ci++)
        if (!visited[ri][ci] && dist[ri][ci] < best)
          { r = ri; c = ci; best = dist[ri][ci]; }
    return new int[]{r, c};
  }


  public static int[][] dijkstra(
      int[][] grid, int sr, int sc) {
    int rows = grid.length;
    int cols = grid[0].length;

    [[dj.init.dist]]int[][] dist = new int[rows][cols];[[/dj.init.dist]]
    [[dj.init.dist]]for (int[] row : dist)[[/dj.init.dist]]
      [[dj.init.dist]]Arrays.fill(row, Integer.MAX_VALUE);[[/dj.init.dist]]
    [[dj.init.visited]]boolean[][] visited = new boolean[rows][cols];[[/dj.init.visited]]
    [[dj.init.setdist]]dist[sr][sc] = 0;[[/dj.init.setdist]]

    [[dj.loop]]for (int i = 0; i < rows * cols; i++) {[[/dj.loop]]
      [[dj.pick]]int[] rc = minDistCell(dist, visited, rows, cols);[[/dj.pick]]
      [[dj.pick]]int r = rc[0], c = rc[1];[[/dj.pick]]
      [[dj.pick]]if (dist[r][c] == Integer.MAX_VALUE) break;[[/dj.pick]]

      [[dj.neighbors]]for (int[] d : DIRS) {[[/dj.neighbors]]
        [[dj.neighbors]]int nr = r + d[0], nc = c + d[1];[[/dj.neighbors]]
        if (nr < 0 || nr >= rows ||
            nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] == 0) continue;

        [[dj.check.visited]]if (visited[nr][nc]) continue;[[/dj.check.visited]]

        [[dj.relax]]int tentative = dist[r][c] + grid[nr][nc];[[/dj.relax]]
        [[dj.relax]]if (tentative < dist[nr][nc]) {[[/dj.relax]]
          [[dj.update]]dist[nr][nc] = tentative;[[/dj.update]]
        }
      }

      [[dj.visit]]visited[r][c] = true;[[/dj.visit]]
    }

    [[dj.done]]return dist;[[/dj.done]]
  }
}`;

export const DIJKSTRA_JAVA_POINTER_HINTS = {
  "dj.loop": ["u"],
  "dj.pick": ["u"],
  "dj.neighbors": ["u", "v"],
  "dj.check.visited": ["u", "v"],
  "dj.relax": ["u", "v"],
  "dj.update": ["u", "v"],
  "dj.skip": ["u", "v"],
  "dj.visit": ["u"],
} as const satisfies Record<string, string[]>;

export const DIJKSTRA_JAVA_POINTER_LABELS = {
  u: "(r,c)",
  v: "(nr,nc)",
} as const satisfies Record<string, string>;
