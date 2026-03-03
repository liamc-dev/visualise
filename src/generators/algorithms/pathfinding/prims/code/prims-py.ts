export const PRIMS_PY =
`# Prim's MST: grow a minimum spanning tree from source
# Greedy: always pick the lightest edge crossing the cut

class Prim:
    def _min_key_vertex(self, key, in_mst, V):
        u, best = -1, float('inf')
        [[prim.pick.scan]]for i in range(V):[[/prim.pick.scan]]
            [[prim.pick.check]]if i not in in_mst and key[i] < best:[[/prim.pick.check]]
                [[prim.pick.best]]u, best = i, key[i][[/prim.pick.best]]
        return u

    def solve(self, V, adj, src):

        [[prim.init.key]]key = [float('inf')] * V[[/prim.init.key]]
        [[prim.init.parent]]parent = [None] * V[[/prim.init.parent]]
        [[prim.init.mst]]in_mst = set()[[/prim.init.mst]]

        [[prim.source]]key[src] = 0[[/prim.source]]

        [[prim.loop]]while len(in_mst) < V:[[/prim.loop]]

            [[prim.pick]]u = self._min_key_vertex(key, in_mst, V)[[/prim.pick]]

            [[prim.add]]in_mst.add(u)[[/prim.add]]

            [[prim.neighbors]]for v, w in adj[u]:[[/prim.neighbors]]

                [[prim.check]]if v not in in_mst:[[/prim.check]]

                    [[prim.relax]]if w < key[v]:[[/prim.relax]]

                        [[prim.update.key]]key[v] = w[[/prim.update.key]]
                        [[prim.update.parent]]parent[v] = u[[/prim.update.parent]]

        [[prim.done]]return key, parent[[/prim.done]]
`;

export const PRIMS_PY_POINTER_HINTS = {
  "prim.loop": [],
  "prim.pick.scan": [],
  "prim.pick.check": [],
  "prim.pick.best": [],
  "prim.pick": ["u"],
  "prim.add": ["u"],
  "prim.neighbors": ["u", "v"],
  "prim.check": ["u", "v"],
  "prim.relax": ["u", "v"],
  "prim.update.key": ["u", "v"],
  "prim.update.parent": ["u", "v"],
} as const satisfies Record<string, string[]>;

export const PRIMS_PY_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
