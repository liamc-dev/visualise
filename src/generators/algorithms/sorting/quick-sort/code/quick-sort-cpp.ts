// src/generators/algorithms/sorting/quick-sort/code/quick-sort.cpp.ts
export const QUICK_SORT_CPP =
` #include <vector>
 #include <utility>
 using std::vector;

 [[qs.init]]static void quickSort(vector<int>& a, int lo, int hi) {[[/qs.init]]
   [[qs.base_return]]if (lo >= hi) return;[[/qs.base_return]]

   [[qs.partition_call]]int p = partition(a, lo, hi);[[/qs.partition_call]]

   [[qs.recurse_left_call]]quickSort(a, lo, p - 1);[[/qs.recurse_left_call]]
   [[qs.recurse_right_call]]quickSort(a, p + 1, hi);[[/qs.recurse_right_call]]
 }

 [[qs.partition_call]]static int partition(vector<int>& a, int left, int right) {[[/qs.partition_call]]
   [[qs.choose_pivot]]igenerators/nt pivot = a[right];[[/qs.choose_pivot]]
   [[qs.choose_pivot]]int i = left;[[/qs.choose_pivot]]

   for (int j = left; j < right; j++) {
     [[qs.compare]]if (a[j] <= pivot) {[[/qs.compare]]
       if (i != j) {
         [[qs.swap]]std::swap(a[i], a[j]);[[/qs.swap]]
       } else {
         [[qs.keep_left]]/* keep a[j] on left side */;[[/qs.keep_left]]
       }
       [[qs.swap]]i++;[[/qs.swap]]
     }
   }

   if (i != right) {
     [[qs.pivot_place]]std::swap(a[i], a[right]);[[/qs.pivot_place]]
   } else {
     [[qs.pivot_already]]/* pivot already in place */;[[/qs.pivot_already]]
   }

   [[qs.partition_return]]return i;[[/qs.partition_return]]
 }`;


export const QUICK_SORT_CPP_POINTER_HINTS = {
  "qs.choose_pivot": ["pivot", "i"],
  "qs.compare": ["pivot", "i", "j"],
  "qs.swap": ["pivot", "i", "j"],
  "qs.keep_left": ["pivot", "i", "j"],
  "qs.boundary_inc": ["pivot", "i"],
  "qs.pivot_place": ["pivot", "i"],
  "qs.pivot_already": ["pivot", "i"],
  "qs.partition_return": ["pivot"],
} as const satisfies Record<string, string[]>;

export const QUICK_SORT_CPP_POINTER_LABELS = {
  pivot: "pivot",
} as const satisfies Record<string, string>;
