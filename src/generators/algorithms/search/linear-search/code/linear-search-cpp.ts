export const LINEAR_SEARCH_CPP =
` #include <vector>
 using std::vector;

 [[lin.init]]int linearSearch(const vector<int>& a, int target) {[[/lin.init]]
   [[lin.check]]for (int i = 0; i < (int)a.size(); i++) {
     if (a[i] == target) {[[/lin.check]]
       [[lin.found]]return i;[[/lin.found]]
     }
     [[lin.next]]// no match, continue[[/lin.next]]
   }
   [[lin.not_found]]return -1;[[/lin.not_found]]
 }`;

export const LINEAR_SEARCH_CPP_POINTER_HINTS = {
  "lin.check": ["i"],
  "lin.found": ["i"],
  "lin.next": ["i"],
} as const satisfies Record<string, string[]>;

export const LINEAR_SEARCH_CPP_POINTER_LABELS = {
  i: "i",
} as const satisfies Record<string, string>;
