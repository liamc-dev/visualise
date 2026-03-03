export const KRUSKALS_TS =
`// Kruskal's MST: sort edges, greedily add if no cycle
// Union-Find detects whether two nodes share a component

type Edge = [number, number, number]; // u, v, weight

class Kruskal {
  private find(parent: number[], x: number): number {
    [[kruskal.find.check]]while (parent[x] !== x) {[[/kruskal.find.check]]
      [[kruskal.find.up]]x = parent[x];[[/kruskal.find.up]]
    }
    return x;
  }

  solve(V: number, edges: Edge[]) {

    [[kruskal.sort]]edges.sort((a, b) => a[2] - b[2]);[[/kruskal.sort]]

    [[kruskal.dsu]]const parent = Array.from({ length: V }, (_, i) => i);[[/kruskal.dsu]]
    [[kruskal.mst]]const mst: Edge[] = [];[[/kruskal.mst]]

    [[kruskal.loop]]for (const [u, v, w] of edges) {[[/kruskal.loop]]

      [[kruskal.find]]const rootU = this.find(parent, u);[[/kruskal.find]]
      [[kruskal.find2]]const rootV = this.find(parent, v);[[/kruskal.find2]]

      [[kruskal.check]]if (rootU !== rootV) {[[/kruskal.check]]

        [[kruskal.add]]mst.push([u, v, w]);[[/kruskal.add]]
        [[kruskal.union]]parent[rootU] = rootV;[[/kruskal.union]]

      [[kruskal.skip]]} // else: same component, skip[[/kruskal.skip]]
    }

    [[kruskal.done]]return mst;[[/kruskal.done]]
  }
}`;

export const KRUSKALS_TS_POINTER_HINTS = {
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

export const KRUSKALS_TS_POINTER_LABELS = {
  u: "u",
  v: "v",
} as const satisfies Record<string, string>;
