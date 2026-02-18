// src/generators/algorithms/merge-sort/code/merge-sort.pseudo.ts

export const MERGE_SORT_PSEUDO =
` [[ms.init]]function mergeSort(a):[[/ms.init]]
   [[ms.base_return]]if len(a) <= 1: return a[[/ms.base_return]]
   [[ms.split]]mid = len(a) / 2[[/ms.split]]
   [[ms.recurse_left]][[ms.return_left]]left = mergeSort(a[0..mid])[[/ms.return_left]][[/ms.recurse_left]]
   [[ms.recurse_right]][[ms.return_right]]right = mergeSort(a[mid..end])[[/ms.return_right]][[/ms.recurse_right]]
   [[ms.return]]return merge(left, right)[[/ms.return]]

 [[ms.merge_start]]function merge(left, right):[[/ms.merge_start]]
   [[ms.merge_start]]i = 0[[/ms.merge_start]]
   [[ms.merge_start]]j = 0[[/ms.merge_start]]
   [[ms.merge_start]]out = [][[/ms.merge_start]]

   [[ms.merge_start]]while i < len(left) and j < len(right):[[/ms.merge_start]]
     [[ms.merge_compare]]if left[i] <= right[j]:[[/ms.merge_compare]]
       [[ms.merge_write_left]]out.push(left[i])[[/ms.merge_write_left]]
       [[ms.merge_write_left]]i = i + 1[[/ms.merge_write_left]]
     else:
       [[ms.merge_write_right]]out.push(right[j])[[/ms.merge_write_right]]
       [[ms.merge_write_right]]j = j + 1[[/ms.merge_write_right]]

   [[ms.merge_write_remaining_left]]while i < len(left):[[/ms.merge_write_remaining_left]]
     [[ms.merge_write_remaining_left]]out.push(left[i])[[/ms.merge_write_remaining_left]]
     [[ms.merge_write_remaining_left]]i = i + 1[[/ms.merge_write_remaining_left]]

   [[ms.merge_write_remaining_right]]while j < len(right):[[/ms.merge_write_remaining_right]]
     [[ms.merge_write_remaining_right]]out.push(right[j])[[/ms.merge_write_remaining_right]]
     [[ms.merge_write_remaining_right]]j = j + 1[[/ms.merge_write_remaining_right]]

   [[ms.merge_done]]return out[[/ms.merge_done]]
`;

export const MERGE_SORT_PSEUDO_POINTER_HINTS = {
  "ms.merge_start": ["i", "j", "k"],
  "ms.merge_compare": ["i", "j", "k"],
  "ms.merge_write_left": ["i", "j", "k"],
  "ms.merge_write_right": ["i", "j", "k"],
  "ms.merge_write_remaining_left": ["i", "k"],
  "ms.merge_write_remaining_right": ["j", "k"],
  "ms.merge_done": [],
} as const satisfies Record<string, string[]>;

export const MERGE_SORT_PSEUDO_POINTER_LABELS = {
  k: "out",
} as const satisfies Record<string, string>;
