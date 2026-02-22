// src/generators/algorithms/sorting/counting-sort/code/counting-sort-py.ts

export const COUNTING_SORT_PY =
` [[cs.init]]def counting_sort(a):[[/cs.init]]
     [[cs.init]]k = max(a) + 1[[/cs.init]]

     [[cs.count_init]]count = [0] * k[[/cs.count_init]]
     output = [0] * len(a)

     [[cs.scan]]for i in range(len(a)):[[/cs.scan]]
         [[cs.count]]count[a[i]] += 1[[/cs.count]]

     [[cs.prefix_read]]for i in range(1, k):[[/cs.prefix_read]]
         [[cs.prefix]]count[i] += count[i - 1][[/cs.prefix]]

     [[cs.read]]for i in range(len(a) - 1, -1, -1):[[/cs.read]]
         [[cs.place]]output[count[a[i]] - 1] = a[i][[/cs.place]]
         [[cs.place]]count[a[i]] -= 1[[/cs.place]]

     [[cs.copy_back]]a[:] = output[[/cs.copy_back]]

     [[cs.done]]return a[[/cs.done]]
`;

export const COUNTING_SORT_PY_POINTER_HINTS = {
  "cs.scan": ["i"],
  "cs.count": ["i"],
  "cs.prefix_read": ["i"],
  "cs.prefix": ["i"],
  "cs.read": ["i"],
  "cs.place": ["i"],
} as const satisfies Record<string, string[]>;

export const COUNTING_SORT_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
