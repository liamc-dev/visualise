// src/generators/algorithms/code/heap-sort/heap-sort-pseudo.ts

export const HEAP_SORT_PSEUDO =
` [[hs.init]]function heapSort(a):[[/hs.init]]
   [[hs.init]]n = length(a)[[/hs.init]]

   [[hs.build_heap]]buildMaxHeap(a)[[/hs.build_heap]]

   for end = n - 1 downTo 1:
     [[hs.extract_max]]swap a[0] with a[end][[/hs.extract_max]]
     [[hs.extract_max]]siftDown(a, 0, end)[[/hs.extract_max]]

   [[hs.done]]return[[/hs.done]]

 [[hs.build_heap]]function buildMaxHeap(a):[[/hs.build_heap]]
   [[hs.build_heap]]n = length(a)[[/hs.build_heap]]
   for i = parent(n - 1) downTo 0:
     [[hs.build_heap]]siftDown(a, i, n)[[/hs.build_heap]]

 [[hs.sift_start]]function siftDown(a, start, heapSize):[[/hs.sift_start]]
   [[hs.sift_start]]root = start[[/hs.sift_start]]

   while true:
     [[hs.loop_check]]left = left(root)[[/hs.loop_check]]
     [[hs.loop_check]]if left >= heapSize: return[[/hs.loop_check]]

     [[hs.pick_left]]child = left[[/hs.pick_left]]
     [[hs.pick_left]]swapIdx = root[[/hs.pick_left]]

     [[hs.pick_left]]if a[child] > a[swapIdx]:[[/hs.pick_left]]
     [[hs.choose_swap_left]]  swapIdx = child[[/hs.choose_swap_left]]

     [[hs.has_right]]right = child + 1[[/hs.has_right]]
     [[hs.has_right]]hasRight = right < heapSize[[/hs.has_right]]

     if hasRight:
       [[hs.pick_right]]if a[right] > a[swapIdx]:[[/hs.pick_right]]
       [[hs.choose_swap_right]]  swapIdx = right[[/hs.choose_swap_right]]

     [[hs.keep]]if swapIdx == root: return[[/hs.keep]]

     [[hs.swap]]swap a[root] with a[swapIdx][[/hs.swap]]
     [[hs.swap]]root = swapIdx[[/hs.swap]]
`;


export const HEAP_SORT_PSEUDO_POINTER_HINTS = {
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


export const HEAP_SORT_PSEUDO_POINTER_LABELS = {
  root: "root",
  child: "child",
  swap: "swap",
  end: "end",
} as const satisfies Record<string, string>;
