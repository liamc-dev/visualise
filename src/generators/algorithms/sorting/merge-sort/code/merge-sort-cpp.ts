// src/generators/algorithms/merge-sort/code/merge-sort.cpp.ts

export const MERGE_SORT_CPP =
`  #include <vector>
  using std::vector;

  [[ms.merge_start]]static vector<int> merge(const vector<int>& left, const vector<int>& right) {[[/ms.merge_start]]
    [[ms.merge_start]]size_t i = 0, j = 0;[[/ms.merge_start]]
    [[ms.merge_start]]vector<int> out;[[/ms.merge_start]]
    [[ms.merge_start]]out.reserve(left.size() + right.size());[[/ms.merge_start]]

    [[ms.merge_start]]while (i < left.size() && j < right.size()) {[[/ms.merge_start]]
     [[ms.merge_compare]]if (left[i] <= right[j])[[/ms.merge_compare]] {
       [[ms.merge_write_left]]out.push_back(left[i]);[[/ms.merge_write_left]]
       [[ms.merge_write_left]]i++;[[/ms.merge_write_left]]
     } else {
       [[ms.merge_write_right]]out.push_back(right[j]);[[/ms.merge_write_right]]
       [[ms.merge_write_right]]j++;[[/ms.merge_write_right]]
     }
   }

   [[ms.merge_write_remaining_left]]while (i < left.size()) {[[/ms.merge_write_remaining_left]]
     [[ms.merge_write_remaining_left]]out.push_back(left[i]);[[/ms.merge_write_remaining_left]]
     [[ms.merge_write_remaining_left]]i++;[[/ms.merge_write_remaining_left]]
   }[[/ms.merge_write_remaining_left]]

   [[ms.merge_write_remaining_right]]while (j < right.size()) {[[/ms.merge_write_remaining_right]]
     [[ms.merge_write_remaining_right]]out.push_back(right[j]);[[/ms.merge_write_remaining_right]]
     [[ms.merge_write_remaining_right]]j++;[[/ms.merge_write_remaining_right]]
   }[[/ms.merge_write_remaining_right]]

   [[ms.merge_done]]return out;[[/ms.merge_done]]
 }[[/ms.merge_start]]

 [[ms.init]]static vector<int> mergeSort(const vector<int>& a) {[[/ms.init]]
   [[ms.base_return]]if (a.size() <= 1) return a;[[/ms.base_return]]

   [[ms.split]]size_t mid = a.size() / 2;[[/ms.split]]
   vector<int> left(a.begin(), a.begin() + mid);
   vector<int> right(a.begin() + mid, a.end());

   [[ms.recurse_left]][[ms.return_left]]left = mergeSort(left);[[/ms.return_left]][[/ms.recurse_left]]
   [[ms.recurse_right]][[ms.return_right]]right = mergeSort(right);[[/ms.return_right]][[/ms.recurse_right]]
   [[ms.return]]return merge(left, right);[[/ms.return]]
 }`;

export const MERGE_SORT_CPP_POINTER_HINTS = {
  "ms.merge_start": ["i", "j", "k"],
  "ms.merge_compare": ["i", "j", "k"],
  "ms.merge_write_left": ["i", "j", "k"],
  "ms.merge_write_right": ["i", "j", "k"],
  "ms.merge_write_remaining_left": ["i", "k"],
  "ms.merge_write_remaining_right": ["j", "k"],
  "ms.merge_done": [],
} as const satisfies Record<string, string[]>;

export const MERGE_SORT_CPP_POINTER_LABELS = {
  k: "out",
} as const satisfies Record<string, string>;
