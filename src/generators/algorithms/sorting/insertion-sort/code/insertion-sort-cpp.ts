export const INSERTION_SORT_CPP =
` #include <vector>
 using std::vector;

 [[is.init]]void insertionSort(vector<int>& a) {[[/is.init]]
   int n = a.size();
   [[is.pick]]for (int i = 1; i < n; i++) {
     int key = a[i];[[/is.pick]]
     int j = i - 1;
     [[is.compare]]while (j >= 0 && a[j] > key) {[[/is.compare]]
       [[is.shift]]a[j + 1] = a[j];
       j--;[[/is.shift]]
     }
     [[is.insert]]a[j + 1] = key;[[/is.insert]]
   }
   [[is.done]]// sorted[[/is.done]]
 }`;

export const INSERTION_SORT_CPP_POINTER_HINTS = {
  "is.pick": ["i"],
  "is.compare": ["i", "j"],
  "is.shift": ["i", "j"],
  "is.insert": ["i"],
} as const satisfies Record<string, string[]>;

export const INSERTION_SORT_CPP_POINTER_LABELS = {
  i: "i",
  j: "j",
  sorted: "sorted",
} as const satisfies Record<string, string>;
