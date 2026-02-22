// src/generators/algorithms/sorting/counting-sort/code/counting-sort-pseudo.ts

export const COUNTING_SORT_PSEUDO =
` [[cs.init]]function countingSort(a):[[/cs.init]]
   [[cs.init]]k = max(a) + 1[[/cs.init]]

   [[cs.count_init]]count = [0] * k[[/cs.count_init]]
   output = [0] * n

   [[cs.scan]]for i = 0 to n - 1:[[/cs.scan]]
     [[cs.count]]count[a[i]] += 1[[/cs.count]]

   [[cs.prefix_read]]for i = 1 to k - 1:[[/cs.prefix_read]]
     [[cs.prefix]]count[i] += count[i - 1][[/cs.prefix]]

   [[cs.read]]for i = n - 1 down to 0:[[/cs.read]]
     [[cs.place]]output[count[a[i]] - 1] = a[i][[/cs.place]]
     [[cs.place]]count[a[i]] -= 1[[/cs.place]]

   [[cs.copy_back]]a = copy of output[[/cs.copy_back]]

   [[cs.done]]return a[[/cs.done]]
`;

export const COUNTING_SORT_PSEUDO_POINTER_HINTS = {
  "cs.scan": ["i"],
  "cs.count": ["i"],
  "cs.prefix_read": ["i"],
  "cs.prefix": ["i"],
  "cs.read": ["i"],
  "cs.place": ["i"],
} as const satisfies Record<string, string[]>;

export const COUNTING_SORT_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
