export const KRUSKALS_PSEUDO =
`// Kruskal's MST: sort edges, greedily add if no cycle
// Union-Find detects whether two nodes share a component

function find(parent, x):
    [[kruskal.find.check]]while parent[x] != x:[[/kruskal.find.check]]
        [[kruskal.find.up]]x = parent[x][[/kruskal.find.up]]
    return x

function kruskal(V, edges):

    [[kruskal.sort]]edges.sort(by weight)[[/kruskal.sort]]

    [[kruskal.dsu]]parent = {v: v for v in V}[[/kruskal.dsu]]
    [[kruskal.mst]]mst = [][[/kruskal.mst]]

    [[kruskal.loop]]for (u, v, w) in edges:[[/kruskal.loop]]

        [[kruskal.find]]rootU = find(parent, u)[[/kruskal.find]]
        [[kruskal.find2]]rootV = find(parent, v)[[/kruskal.find2]]

        [[kruskal.check]]if rootU != rootV:[[/kruskal.check]]

            [[kruskal.add]]mst.append((u, v, w))[[/kruskal.add]]
            [[kruskal.union]]parent[rootU] = rootV[[/kruskal.union]]

        [[kruskal.skip]]else: skip  // same component[[/kruskal.skip]]

    [[kruskal.done]]return mst[[/kruskal.done]]
`;

export const KRUSKALS_PSEUDO_POINTER_HINTS = {
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

export const KRUSKALS_PSEUDO_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
