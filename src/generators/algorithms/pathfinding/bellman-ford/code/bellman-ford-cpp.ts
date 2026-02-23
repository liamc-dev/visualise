export const BELLMAN_FORD_CPP =
`// Bellman-Ford: shortest paths from source
// Can handle negative weights (Dijkstra cannot)
// Detects negative-weight cycles

#include <vector>
#include <climits>
#include <stdexcept>
using namespace std;

struct Edge { int u, v, w; };

[[bf.init]]pair<vector<int>, vector<int>> bellmanFord(
    int V, vector<Edge>& edges, int src) {
  vector<int> dist(V, INT_MAX);
  vector<int> prev(V, -1);[[/bf.init]]

  [[bf.source]]dist[src] = 0;[[/bf.source]]

  // Relax all edges V-1 times
  [[bf.pass]]for (int i = 1; i < V; i++) {[[/bf.pass]]

    [[bf.edge]]for (auto& e : edges) {[[/bf.edge]]

      [[bf.relax]]if (dist[e.u] != INT_MAX
          && dist[e.u] + e.w < dist[e.v]) {[[/bf.relax]]
        [[bf.update]]dist[e.v] = dist[e.u] + e.w;
        prev[e.v] = e.u;[[/bf.update]]
      }
    }
  }

  // Check for negative-weight cycles
  for (auto& e : edges) {
    if (dist[e.u] != INT_MAX
        && dist[e.u] + e.w < dist[e.v]) {
      throw runtime_error(
        "negative cycle detected");
    }
  }

  [[bf.done]]return {dist, prev};[[/bf.done]]
}`;

export const BELLMAN_FORD_CPP_POINTER_HINTS = {
  "bf.pass": [],
  "bf.edge": ["u", "v"],
  "bf.relax": ["u", "v"],
  "bf.update": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const BELLMAN_FORD_CPP_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
