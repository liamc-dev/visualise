// src/generators/algorithms/sorting/radix-sort/code/radix-sort.ts

export const RADIX_SORT_TS =
` [[rx.init]]function radixSort(a: number[]): number[] {[[/rx.init]]
   [[rx.init]]const max = Math.max(...a);[[/rx.init]]

   [[rx.digit_start]]for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {[[/rx.digit_start]]
     const count = new Array(10).fill(0);
     const output = new Array(a.length).fill(0);

     [[rx.extract]]for (let i = 0; i < a.length; i++) {[[/rx.extract]]
       [[rx.extract]]const digit = Math.floor(a[i] / exp) % 10;[[/rx.extract]]
       [[rx.count]]count[digit]++;[[/rx.count]]
     }

     [[rx.prefix]]for (let i = 1; i < 10; i++) {[[/rx.prefix]]
       [[rx.prefix]]count[i] += count[i - 1];[[/rx.prefix]]
     }

     [[rx.place]]for (let i = a.length - 1; i >= 0; i--) {[[/rx.place]]
       [[rx.place]]const digit = Math.floor(a[i] / exp) % 10;[[/rx.place]]
       [[rx.place]]output[count[digit] - 1] = a[i];[[/rx.place]]
       [[rx.place]]count[digit]--;[[/rx.place]]
     }

     [[rx.copy_back]]a = [...output];[[/rx.copy_back]]
   }

   [[rx.done]]return a;[[/rx.done]]
 }
`;

export const RADIX_SORT_TS_POINTER_HINTS = {
  "rx.extract": ["i"],
  "rx.count": ["i"],
  "rx.place": ["i"],
} as const satisfies Record<string, string[]>;

export const RADIX_SORT_TS_POINTER_LABELS = {} as const satisfies Record<string, string>;
