// src/generators/algorithms/sorting/quick-sort/code/quick-sort.pseudo.ts

export const QUICK_SORT_PSEUDO =
` [[qs.init]]function quickSort(a, lo, hi):[[/qs.init]]
   [[qs.base_return]]if lo >= hi: return[[/qs.base_return]]

   [[qs.partition_call]]p = partition(a, lo, hi)[[/qs.partition_call]]

   [[qs.recurse_left_call]]quickSort(a, lo, p - 1)[[/qs.recurse_left_call]]
   [[qs.recurse_right_call]]quickSort(a, p + 1, hi)[[/qs.recurse_right_call]]
   [[qs.done]]return[[/qs.done]]

 [[qs.partition_call]]function partition(a, lo, hi):[[/qs.partition_call]]
   [[qs.choose_pivot]]pivot = a[hi][[/qs.choose_pivot]]
   [[qs.choose_pivot]]i = lo[[/qs.choose_pivot]]

   for j = lo .. hi - 1:
     [[qs.compare]]if a[j] <= pivot:[[/qs.compare]]
       [[qs.swap]]swap a[i] with a[j][[/qs.swap]]
       [[qs.swap]]i = i + 1[[/qs.swap]]

   [[qs.pivot_place]]swap a[i] with a[hi][[/qs.pivot_place]]
   [[qs.partition_return]]return i[[/qs.partition_return]]
`;

export const QUICK_SORT_PSEUDO_POINTER_HINTS = {
  "qs.choose_pivot": ["pivot", "i"],
  "qs.compare": ["pivot", "i", "j"],
  "qs.swap": ["pivot", "i", "j"],
  "qs.keep_left": ["pivot", "i", "j"],
  "qs.pivot_place": ["pivot", "i"],
  "qs.pivot_already": ["pivot", "i"],
  "qs.partition_return": ["pivot"],
} as const satisfies Record<string, string[]>;

export const QUICK_SORT_PSEUDO_POINTER_LABELS = {
  pivot: "pivot",
} as const satisfies Record<string, string>;
