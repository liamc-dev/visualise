// src/generators/algorithms/sorting/radix-sort/code/radix-sort-pseudo.ts

export const RADIX_SORT_PSEUDO =
` [[rx.init]]function radixSort(a):[[/rx.init]]
   [[rx.init]]max = maximum of a[[/rx.init]]

   [[rx.digit_start]]for exp = 1, 10, 100, ...:[[/rx.digit_start]]
     count = [0] * 10

     [[rx.extract]]for i = 0 to n - 1:[[/rx.extract]]
       [[rx.extract]]digit = (a[i] / exp) % 10[[/rx.extract]]
       [[rx.count]]count[digit] += 1[[/rx.count]]

     [[rx.prefix]]for i = 1 to 9:[[/rx.prefix]]
       [[rx.prefix]]count[i] += count[i - 1][[/rx.prefix]]

     [[rx.place]]for i = n - 1 down to 0:[[/rx.place]]
       [[rx.place]]digit = (a[i] / exp) % 10[[/rx.place]]
       [[rx.place]]output[count[digit] - 1] = a[i][[/rx.place]]
       [[rx.place]]count[digit] -= 1[[/rx.place]]

     [[rx.copy_back]]a = copy of output[[/rx.copy_back]]

   [[rx.done]]return a[[/rx.done]]
`;

export const RADIX_SORT_PSEUDO_POINTER_HINTS = {
  "rx.extract": ["i"],
  "rx.count": ["i"],
  "rx.place": ["i"],
} as const satisfies Record<string, string[]>;

export const RADIX_SORT_PSEUDO_POINTER_LABELS = {} as const satisfies Record<string, string>;
