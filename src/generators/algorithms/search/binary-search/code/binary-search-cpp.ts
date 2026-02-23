export const BINARY_SEARCH_CPP =
` #include <vector>
 using std::vector;

 [[bin.init]]int binarySearch(const vector<int>& a, int target) {[[/bin.init]]
   int lo = 0, hi = (int)a.size() - 1;
   [[bin.loop]]while (lo <= hi) {[[/bin.loop]]
     [[bin.mid]]int mid = (lo + hi) / 2;[[/bin.mid]]
     [[bin.compare]]if (a[mid] == target) {[[/bin.compare]]
       [[bin.found]]return mid;[[/bin.found]]
     [[bin.go_right]]} else if (a[mid] < target) {
       lo = mid + 1;[[/bin.go_right]]
     [[bin.go_left]]} else {
       hi = mid - 1;[[/bin.go_left]]
     }
   }
   [[bin.not_found]]return -1;[[/bin.not_found]]
 }`;

export const BINARY_SEARCH_CPP_POINTER_HINTS = {
  "bin.loop": ["lo", "hi"],
  "bin.mid": ["lo", "hi", "mid"],
  "bin.compare": ["lo", "hi", "mid"],
  "bin.found": ["mid"],
  "bin.go_right": ["lo", "hi"],
  "bin.go_left": ["lo", "hi"],
} as const satisfies Record<string, string[]>;

export const BINARY_SEARCH_CPP_POINTER_LABELS = {
  lo: "lo",
  hi: "hi",
  mid: "mid",
} as const satisfies Record<string, string>;
