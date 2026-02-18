// src/generators/algorithms/code/heap-sort/heap-sort-java.ts

export const HEAP_SORT_JAVA =
`  public class HeapSort {

   [[hs.init]]public static void heapSort(int[] a) {[[/hs.init]]
     [[hs.init]]int n = a.length;[[/hs.init]]

     [[hs.build_heap]]buildMaxHeap(a, n);[[/hs.build_heap]]

     for (int end = n - 1; end > 0; end--) {
       [[hs.extract_max]]swap(a, 0, end);[[/hs.extract_max]]
       [[hs.extract_max]]siftDown(a, 0, end);[[/hs.extract_max]]
     }

     [[hs.done]]return;[[/hs.done]]
   }

   [[hs.build_heap]]private static void buildMaxHeap(int[] a, int n) {[[/hs.build_heap]]
     for (int i = parent(n - 1); i >= 0; i--) {
       [[hs.build_heap]]siftDown(a, i, n);[[/hs.build_heap]]
     }
   }

   [[hs.sift_start]]private static void siftDown(int[] a, int start, int heapSize) {[[/hs.sift_start]]
     [[hs.sift_start]]int root = start;[[/hs.sift_start]]

     while (true) {
       [[hs.loop_check]]int left = left(root);[[/hs.loop_check]]
       [[hs.loop_check]]if (left >= heapSize) return;[[/hs.loop_check]]

       [[hs.pick_left]]int child = left;[[/hs.pick_left]]
       [[hs.pick_left]]int swapIdx = root;[[/hs.pick_left]]

       [[hs.pick_left]]if (a[child] > a[swapIdx])[[/hs.pick_left]]
         [[hs.choose_swap_left]]swapIdx = child;[[/hs.choose_swap_left]]

       [[hs.has_right]]int right = child + 1;[[/hs.has_right]]
       [[hs.has_right]]boolean hasRight = right < heapSize;[[/hs.has_right]]

       if (hasRight) {
         [[hs.pick_right]]if (a[right] > a[swapIdx])[[/hs.pick_right]]
           [[hs.choose_swap_right]]swapIdx = right;[[/hs.choose_swap_right]]
       }

       [[hs.keep]]if (swapIdx == root) return;[[/hs.keep]]

       [[hs.swap]]swap(a, root, swapIdx);[[/hs.swap]]
       [[hs.swap]]root = swapIdx;[[/hs.swap]]
     }
   }

   private static int parent(int i) {
     return (i - 1) / 2;
   }

   private static int left(int i) {
     return 2 * i + 1;
   }

   private static void swap(int[] a, int i, int j) {
     int t = a[i];
     a[i] = a[j];
     a[j] = t;
   }
 }`;


export const HEAP_SORT_JAVA_POINTER_HINTS = {
  "hs.init": ["end"],
  "hs.build_heap": ["root", "end"],
  "hs.extract_max": ["root", "end"],

  "hs.sift_start": ["root", "end"],
  "hs.loop_check": ["root", "child", "end"],

  "hs.pick_left": ["root", "child", "swap", "end"],
  "hs.choose_swap_left": ["root", "swap", "end"],

  "hs.has_right": ["root", "child", "end"],
  "hs.pick_right": ["root", "child", "swap", "end"],
  "hs.choose_swap_right": ["root", "swap", "end"],

  "hs.keep": ["root", "end"],
  "hs.swap": ["root", "swap", "end"],

  "hs.done": ["end"],
} as const satisfies Record<string, string[]>;

export const HEAP_SORT_JAVA_POINTER_LABELS = {
  root: "root",
  child: "child",
  swap: "swap",
  end: "end",
} as const satisfies Record<string, string>;
