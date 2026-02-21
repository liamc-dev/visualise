// src/generators/algorithms/sorting/radix-sort/code/radix-sort-py.ts

export const RADIX_SORT_PY =
` [[rx.init]]def radix_sort(a):[[/rx.init]]
     [[rx.init]]max_val = max(a)[[/rx.init]]

     [[rx.digit_start]]exp = 1[[/rx.digit_start]]
     [[rx.digit_start]]while max_val // exp > 0:[[/rx.digit_start]]
         count = [0] * 10
         output = [0] * len(a)

         [[rx.extract]]for i in range(len(a)):[[/rx.extract]]
             [[rx.extract]]digit = (a[i] // exp) % 10[[/rx.extract]]
             [[rx.count]]count[digit] += 1[[/rx.count]]

         [[rx.prefix]]for i in range(1, 10):[[/rx.prefix]]
             [[rx.prefix]]count[i] += count[i - 1][[/rx.prefix]]

         [[rx.place]]for i in range(len(a) - 1, -1, -1):[[/rx.place]]
             [[rx.place]]digit = (a[i] // exp) % 10[[/rx.place]]
             [[rx.place]]output[count[digit] - 1] = a[i][[/rx.place]]
             [[rx.place]]count[digit] -= 1[[/rx.place]]

         [[rx.copy_back]]a = output[:][[/rx.copy_back]]
         [[rx.digit_start]]exp *= 10[[/rx.digit_start]]

     [[rx.done]]return a[[/rx.done]]
`;

export const RADIX_SORT_PY_POINTER_HINTS = {
  "rx.extract": ["i"],
  "rx.count": ["i"],
  "rx.place": ["i"],
} as const satisfies Record<string, string[]>;

export const RADIX_SORT_PY_POINTER_LABELS = {} as const satisfies Record<string, string>;
