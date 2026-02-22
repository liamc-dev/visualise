// src/generators/algorithms/sorting/counting-sort/code/counting-sort-ts.ts

export const COUNTING_SORT_TS =
` [[cs.init]]function countingSort(a: number[]): number[] {[[/cs.init]]
   [[cs.init]]const k = Math.max(...a) + 1;[[/cs.init]]

   [[cs.count_init]]const count = new Array(k).fill(0);[[/cs.count_init]]
   const output = new Array(a.length).fill(0);

   [[cs.scan]]for (let i = 0; i < a.length; i++) {[[/cs.scan]]
     [[cs.count]]count[a[i]]++;[[/cs.count]]
   }

   [[cs.prefix_read]]for (let i = 1; i < k; i++) {[[/cs.prefix_read]]
     [[cs.prefix]]count[i] += count[i - 1];[[/cs.prefix]]
   }

   [[cs.read]]for (let i = a.length - 1; i >= 0; i--) {[[/cs.read]]
     [[cs.place]]output[count[a[i]] - 1] = a[i];[[/cs.place]]
     [[cs.place]]count[a[i]]--;[[/cs.place]]
   }

   [[cs.copy_back]]return [...output];[[/cs.copy_back]]
 [[cs.done]]}[[/cs.done]]
`;

export const COUNTING_SORT_TS_POINTER_HINTS = {
  "cs.scan": ["i"],
  "cs.count": ["i"],
  "cs.prefix_read": ["i"],
  "cs.prefix": ["i"],
  "cs.read": ["i"],
  "cs.place": ["i"],
} as const satisfies Record<string, string[]>;

export const COUNTING_SORT_TS_POINTER_LABELS = {} as const satisfies Record<string, string>;
