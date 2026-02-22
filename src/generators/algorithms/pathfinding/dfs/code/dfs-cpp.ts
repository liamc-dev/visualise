export const DFS_CPP =
`#include <vector>
#include <stack>

class DFS {
public:
  static std::vector<std::vector<int>> dfs(
      std::vector<std::vector<int>>& grid, int sr, int sc) {
    int rows = grid.size();
    int cols = grid[0].size();
    int dirs[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    [[dfs.init.stack]]std::stack<std::pair<int,int>> stk;[[/dfs.init.stack]]
    [[dfs.init.visited]]std::vector<std::vector<bool>> visited(
      rows, std::vector<bool>(cols, false));[[/dfs.init.visited]]
    [[dfs.init.order]]std::vector<std::vector<int>> order(
      rows, std::vector<int>(cols, -1));[[/dfs.init.order]]
    int count = 0;
    [[dfs.init.mark]]visited[sr][sc] = true;[[/dfs.init.mark]]
    [[dfs.init.setorder]]order[sr][sc] = ++count;[[/dfs.init.setorder]]
    [[dfs.init.push]]stk.push({sr, sc});[[/dfs.init.push]]

    [[dfs.loop]]while (!stk.empty()) {[[/dfs.loop]]
      [[dfs.pop]]auto [r, c] = stk.top(); stk.pop();[[/dfs.pop]]

      [[dfs.check]]for (auto [dr, dc] : dirs) {[[/dfs.check]]
        [[dfs.check]]int nr = r + dr;[[/dfs.check]]
        [[dfs.check]]int nc = c + dc;[[/dfs.check]]

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
        [[dfs.setorder]]order[nr][nc] = ++count;[[/dfs.setorder]]
        [[dfs.push]]stk.push({nr, nc});[[/dfs.push]]
      }
    }

    [[dfs.done]]return order;[[/dfs.done]]
  }
};`;

export const DFS_CPP_POINTER_HINTS = {
  "dfs.pop": ["cur"],
  "dfs.check": ["cur"],
  "dfs.oob": ["cur"],
  "dfs.wall": ["cur", "nb"],
  "dfs.visited": ["cur", "nb"],
  "dfs.mark": ["cur", "nb"],
  "dfs.setorder": ["cur", "nb"],
  "dfs.push": ["cur", "nb"],
} as const satisfies Record<string, string[]>;

export const DFS_CPP_POINTER_LABELS = {
  cur: "(r,c)",
  nb: "(nr,nc)",
} as const satisfies Record<string, string>;
