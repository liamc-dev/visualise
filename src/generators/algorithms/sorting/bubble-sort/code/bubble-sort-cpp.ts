export const BUBBLE_SORT_CPP =
` #include <vector>
 #include <utility>
 using std::vector;

 [[bs.init]]void bubbleSort(vector<int>& a) {[[/bs.init]]
   int n = a.size();
   [[bs.pass_start]]for (int i = 0; i < n - 1; i++) {[[/bs.pass_start]]
     for (int j = 0; j < n - i - 1; j++) {
       [[bs.compare]]if (a[j] > a[j + 1]) {[[/bs.compare]]
         [[bs.swap]]std::swap(a[j], a[j + 1]);[[/bs.swap]]
       }[[bs.no_swap]] /* else: already in order */[[/bs.no_swap]]
     }
     [[bs.pass_done]]// end of pass[[/bs.pass_done]]
   }
   [[bs.done]]// sorted[[/bs.done]]
 }`;

export const BUBBLE_SORT_CPP_POINTER_HINTS = {
  "bs.compare": ["j", "j+1"],
  "bs.swap": ["j", "j+1"],
  "bs.no_swap": ["j", "j+1"],
  "bs.pass_done": ["sorted"],
} as const satisfies Record<string, string[]>;

export const BUBBLE_SORT_CPP_POINTER_LABELS = {
  j: "j",
  "j+1": "j+1",
  sorted: "sorted",
} as const satisfies Record<string, string>;
