export const KRUSKALS_PY =
`# Kruskal's MST: sort edges, greedily add if no cycle
# Union-Find detects whether two nodes share a component

class Kruskal:
    def _find(self, parent, x):
        [[kruskal.find.check]]while parent[x] != x:[[/kruskal.find.check]]
            [[kruskal.find.up]]x = parent[x][[/kruskal.find.up]]
        return x

    def solve(self, V, edges):

        [[kruskal.sort]]edges.sort(key=lambda e: e[2])[[/kruskal.sort]]

        [[kruskal.dsu]]parent = {v: v for v in range(V)}[[/kruskal.dsu]]
        [[kruskal.mst]]mst = [][[/kruskal.mst]]

        [[kruskal.loop]]for u, v, w in edges:[[/kruskal.loop]]

            [[kruskal.find]]root_u = self._find(parent, u)[[/kruskal.find]]
            [[kruskal.find2]]root_v = self._find(parent, v)[[/kruskal.find2]]

            [[kruskal.check]]if root_u != root_v:[[/kruskal.check]]

                [[kruskal.add]]mst.append((u, v, w))[[/kruskal.add]]
                [[kruskal.union]]parent[root_u] = root_v[[/kruskal.union]]

            [[kruskal.skip]]# else: same component, skip[[/kruskal.skip]]

        [[kruskal.done]]return mst[[/kruskal.done]]
`;

export const KRUSKALS_PY_POINTER_HINTS = {
  "kruskal.loop": ["u", "v"],
  "kruskal.find": ["u", "v"],
  "kruskal.find.check": ["u", "v"],
  "kruskal.find.up": ["u", "v"],
  "kruskal.find2": ["u", "v"],
  "kruskal.check": ["u", "v"],
  "kruskal.add": ["u", "v"],
  "kruskal.union": ["u", "v"],
  "kruskal.skip": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const KRUSKALS_PY_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
