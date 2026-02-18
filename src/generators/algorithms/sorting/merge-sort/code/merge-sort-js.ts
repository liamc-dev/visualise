// src/generators/algorithms/merge-sort/code/merge-sort.js.ts

export const MERGE_SORT_JS =
` [[ms.init]]function mergeSort(a) {[[/ms.init]]
   [[ms.base_return]]if (a.length <= 1) return a;[[/ms.base_return]]

   [[ms.split]]const mid = Math.floor(a.length / 2);[[/ms.split]]

   [[ms.recurse_left]]const left = mergeSort(a.slice(0, mid));[[/ms.recurse_left]]
   [[ms.recurse_right]]const right = mergeSort(a.slice(mid));[[/ms.recurse_right]]

   [[ms.return]]return merge(left, right);[[/ms.return]]
 }

 [[ms.merge_start]]function merge(left, right) {
   let i = 0;
   let j = 0;
   const out = [];

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

export const MERGE_SORT_JS_POINTER_HINTS = {
  "ms.merge_start": ["i", "j", "k"],
  "ms.merge_compare": ["i", "j", "k"],
  "ms.merge_write_left": ["i", "j", "k"],
  "ms.merge_write_right": ["i", "j", "k"],
  "ms.merge_write_remaining_left": ["i", "k"],
  "ms.merge_write_remaining_right": ["j", "k"],
  "ms.merge_done": [],
} as const satisfies Record<string, string[]>;

export const MERGE_SORT_JS_POINTER_LABELS = {
  k: "out",
} as const satisfies Record<string, string>;
