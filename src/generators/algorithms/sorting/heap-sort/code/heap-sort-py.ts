// src/generators/algorithms/code/heap-sort/heap-sort.py.ts

export const HEAP_SORT_PY =
`[[hs.init]]def heap_sort(a):[[/hs.init]]
  [[hs.init]]n = len(a)[[/hs.init]]

  [[hs.build_heap]]build_max_heap(a, n)[[/hs.build_heap]]

  for end in range(n - 1, 0, -1):
    [[hs.extract_max]]swap(a, 0, end)[[/hs.extract_max]]
    [[hs.extract_max]]sift_down(a, 0, end)[[/hs.extract_max]]

  [[hs.done]]return[[/hs.done]]

[[hs.build_heap]]def build_max_heap(a, n):[[/hs.build_heap]]
  for i in range(parent(n - 1), -1, -1):
    [[hs.build_heap]]sift_down(a, i, n)[[/hs.build_heap]]

[[hs.sift_start]]def sift_down(a, start, heap_size):[[/hs.sift_start]]
  [[hs.sift_start]]root = start[[/hs.sift_start]]

  while True:
    [[hs.loop_check]]left = left_child(root)[[/hs.loop_check]]
    [[hs.loop_check]]if left >= heap_size: return[[/hs.loop_check]]

    [[hs.pick_left]]child = left[[/hs.pick_left]]
    [[hs.pick_left]]swap_idx = root[[/hs.pick_left]]

    [[hs.pick_left]]if a[child] > a[swap_idx]:[[/hs.pick_left]]
      [[hs.choose_swap_left]]swap_idx = child[[/hs.choose_swap_left]]

    [[hs.has_right]]right = child + 1[[/hs.has_right]]
    [[hs.has_right]]has_right = right < heap_size[[/hs.has_right]]

    if has_right:
      [[hs.pick_right]]if a[right] > a[swap_idx]:[[/hs.pick_right]]
        [[hs.choose_swap_right]]swap_idx = right[[/hs.choose_swap_right]]

    [[hs.keep]]if swap_idx == root: return[[/hs.keep]]

    [[hs.swap]]swap(a, root, swap_idx)[[/hs.swap]]
    [[hs.swap]]root = swap_idx[[/hs.swap]]

def parent(i):
  return (i - 1) // 2

def left_child(i):
  return 2 * i + 1

def swap(a, i, j):
  t = a[i]
  a[i] = a[j]
  a[j] = t
`;


export const HEAP_SORT_PY_POINTER_HINTS = {
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


export const HEAP_SORT_PY_POINTER_LABELS = {
  root: "root",
  child: "child",
  swap: "swap",
  end: "end",
} as const satisfies Record<string, string>;
