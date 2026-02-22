export const SELECTION_SORT_CPP =
` #include <vector>
 #include <utility>
 using std::vector;

 [[ss.init]]void selectionSort(vector<int>& a) {[[/ss.init]]
   int n = a.size();
   [[ss.search_start]]for (int i = 0; i < n - 1; i++) {[[/ss.search_start]]
     int min = i;
     for (int j = i + 1; j < n; j++) {
       [[ss.compare]]if (a[j] < a[min]) {[[/ss.compare]]
         [[ss.new_min]]min = j;[[/ss.new_min]]
       }
     }
     [[ss.swap]]if (min != i) std::swap(a[i], a[min]);[[/ss.swap]]
     [[ss.place_done]]// a[i] settled[[/ss.place_done]]
   }
   [[ss.done]]// sorted[[/ss.done]]
 }`;

export const SELECTION_SORT_CPP_POINTER_HINTS = {
  "ss.search_start": ["i", "min"],
  "ss.compare": ["j", "min"],
  "ss.new_min": ["j", "min"],
  "ss.swap": ["i", "min"],
  "ss.place_done": ["i"],
} as const satisfies Record<string, string[]>;

export const SELECTION_SORT_CPP_POINTER_LABELS = {
  i: "i",
  j: "j",
  min: "min",
} as const satisfies Record<string, string>;
