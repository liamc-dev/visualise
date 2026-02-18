// src/generators/algorithms/code/quick-sort/quick-sort.ts

export const QUICK_SORT_TS =
` [[qs.init]]export function quickSort(a: number[], lo: number, hi: number): void {[[/qs.init]]
   [[qs.base_return]]if (lo >= hi) return;[[/qs.base_return]]

   [[qs.partition_call]]const p = partition(a, lo, hi);[[/qs.partition_call]]

   [[qs.recurse_left_call]]quickSort(a, lo, p - 1);[[/qs.recurse_left_call]]
   [[qs.recurse_right_call]]quickSort(a, p + 1, hi);[[/qs.recurse_right_call]]
   [[qs.done]]return;[[/qs.done]]
 }

 [[qs.partition_call]]function partition(a: number[], left: number, right: number): number {[[/qs.partition_call]]
   [[qs.choose_pivot]]const pivot = a[right];[[/qs.choose_pivot]]
   [[qs.choose_pivot]]let i = left;[[/qs.choose_pivot]]

   for (let j = left; j < right; j++) {
     [[qs.compare]]if (a[j] <= pivot) {[[/qs.compare]]
       if (i !== j) {
         [[qs.swap]][a[i], a[j]] = [a[j], a[i]];[[/qs.swap]]
       } else {
         [[qs.keep_left]]/* keep a[j] on left side */;[[/qs.keep_left]]
       }
       [[qs.boundary_inc]]i++;[[/qs.boundary_inc]]
     }
   }

   if (i !== right) {
     [[qs.pivot_place]][a[i], a[right]] = [a[right], a[i]];[[/qs.pivot_place]]
   } else {
     [[qs.pivot_already]]/* pivot already in place */;[[/qs.pivot_already]]
   }

   [[qs.partition_return]]return i;[[/qs.partition_return]]
 }`;

export const QUICK_SORT_TS_TOKENS = {
  "qs.init": [1, 1],
  "qs.base_return": [2, 2],
  "qs.partition_call": [4, 4],
  "qs.recurse_left_call": [6, 6],
  "qs.recurse_right_call": [7, 7],
  "qs.done": [8, 8],

  "qs.choose_pivot": [12, 13],
  "qs.compare": [16, 16],
  "qs.swap": [18, 18],
  "qs.keep_left": [20, 20],
  "qs.boundary_inc": [22, 22],

  "qs.pivot_place": [27, 27],
  "qs.pivot_already": [29, 29],
  "qs.partition_return": [32, 32],
} as const satisfies Record<string, [number, number]>;

export const QUICK_SORT_TS_POINTER_HINTS = {
  "qs.choose_pivot": ["pivot", "i"],
  "qs.compare": ["pivot", "i", "j"],
  "qs.swap": ["pivot", "i", "j"],
  "qs.keep_left": ["pivot", "i", "j"],
  "qs.boundary_inc": ["pivot", "i"],
  "qs.pivot_place": ["pivot", "i"],
  "qs.pivot_already": ["pivot", "i"],
  "qs.partition_return": ["pivot"],
} as const satisfies Record<string, string[]>;

export const QUICK_SORT_TS_POINTER_LABELS = {
  pivot: "pivot",
} as const satisfies Record<string, string>;

