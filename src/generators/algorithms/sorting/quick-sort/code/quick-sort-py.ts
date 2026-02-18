// src/generators/algorithms/sorting/quick-sort/code/quick-sort.py.ts

export const QUICK_SORT_PY =
` [[qs.init]]def quick_sort(a, lo, hi):[[/qs.init]]
   [[qs.base_return]]if lo >= hi: return[[/qs.base_return]]

   [[qs.partition_call]]p = partition(a, lo, hi)[[/qs.partition_call]]

   [[qs.recurse_left_call]]quick_sort(a, lo, p - 1)[[/qs.recurse_left_call]]
   [[qs.recurse_right_call]]quick_sort(a, p + 1, hi)[[/qs.recurse_right_call]]
   [[qs.done]]return[[/qs.done]]

 [[qs.partition_call]]def partition(a, left, right):[[/qs.partition_call]]
   [[qs.choose_pivot]]pivot = a[right][[/qs.choose_pivot]]
   [[qs.choose_pivot]]i = left[[/qs.choose_pivot]]

   for j in range(left, right):
     [[qs.compare]]if a[j] <= pivot:[[/qs.compare]]
       if i != j:
         [[qs.swap]]a[i], a[j] = a[j], a[i][[/qs.swap]]
       else:
         [[qs.keep_left]]# keep a[j] on left side[[/qs.keep_left]]
       [[qs.boundary_inc]]i += 1[[/qs.boundary_inc]]

   if i != right:
     [[qs.pivot_place]]a[i], a[right] = a[right], a[i][[/qs.pivot_place]]
   else:
     [[qs.pivot_already]]# pivot already in place[[/qs.pivot_already]]

   [[qs.partition_return]]return i[[/qs.partition_return]]
`;

export const QUICK_SORT_PY_POINTER_HINTS = {
  "qs.choose_pivot": ["pivot", "i"],
  "qs.compare": ["pivot", "i", "j"],
  "qs.swap": ["pivot", "i", "j"],
  "qs.keep_left": ["pivot", "i", "j"],
  "qs.boundary_inc": ["pivot", "i"],
  "qs.pivot_place": ["pivot", "i"],
  "qs.pivot_already": ["pivot", "i"],
  "qs.partition_return": ["pivot"],
} as const satisfies Record<string, string[]>;

export const QUICK_SORT_PY_POINTER_LABELS = {
  pivot: "pivot",
} as const satisfies Record<string, string>;


