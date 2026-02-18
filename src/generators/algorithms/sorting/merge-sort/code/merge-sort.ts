// src/generators/algorithms/merge-sort/code/merge-sort.ts

export const MERGE_SORT_TS =
` [[ms.init]]function mergeSort(a: number[]): number[] {[[/ms.init]]
   [[ms.base_return]]if (a.length <= 1) return a;[[/ms.base_return]]

   [[ms.split]]const mid = Math.floor(a.length / 2);[[/ms.split]]

   [[ms.recurse_left]]const left = mergeSort(a.slice(0, mid));[[/ms.recurse_left]]
   [[ms.recurse_right]]const right = mergeSort(a.slice(mid));[[/ms.recurse_right]]

   [[ms.return]]return merge(left, right);[[/ms.return]]
 }

 [[ms.merge_start]]function merge(left: number[], right: number[]): number[] {
   let i = 0;
   let j = 0;
   const out: number[] = [];

   while (i < left.length && j < right.length) {
     [[ms.merge_compare]]if (left[i] <= right[j])[[/ms.merge_compare]] {
       [[ms.merge_write_left]]out.push(left[i]);
       i++;[[/ms.merge_write_left]]
     } else {
       [[ms.merge_write_right]]out.push(right[j]);
       j++;[[/ms.merge_write_right]]
     }
   }

   [[ms.merge_write_remaining_left]]while (i < left.length) {
     out.push(left[i]);
     i++;
   }[[/ms.merge_write_remaining_left]]

   [[ms.merge_write_remaining_right]]while (j < right.length) {
     out.push(right[j]);
     j++;
   }[[/ms.merge_write_remaining_right]]

   [[ms.merge_done]]return out;[[/ms.merge_done]]
 }[[/ms.merge_start]]
`;

export const MERGE_SORT_TS_TOKENS = {
  "ms.init": [1, 1],
  "ms.done": [9, 9],

  "ms.base_return": [2, 2],
  "ms.split": [4, 4],

  "ms.recurse_left": [6, 6],
  "ms.recurse_right": [7, 7],

  "ms.return_left": [6, 6],
  "ms.return_right": [7, 7],
  "ms.return": [9, 9],

  "ms.merge_start": [12, 16],
  "ms.merge_compare": [18, 18],

  "ms.merge_write_left": [19, 20],
  "ms.merge_write_right": [22, 23],

  "ms.merge_write_remaining_left": [27, 30],
  "ms.merge_write_remaining_right": [32, 35],

  "ms.merge_done": [37, 37],
} as const satisfies Record<string, [number, number]>;

export const MERGE_SORT_TS_POINTER_HINTS = {
  "ms.merge_start": ["i", "j", "k"],
  "ms.merge_compare": ["i", "j", "k"],
  "ms.merge_write_left": ["i", "j", "k"],
  "ms.merge_write_right": ["i", "j", "k"],
  "ms.merge_write_remaining_left": ["i", "k"],
  "ms.merge_write_remaining_right": ["j", "k"],
  "ms.merge_done": [],
} as const satisfies Record<string, string[]>;

export const MERGE_SORT_TS_POINTER_LABELS = {
  k: "out",
} as const satisfies Record<string, string>;
