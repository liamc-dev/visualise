// src/generators/algorithms/code/heap-sort/heap-sort.ts

export const HEAP_SORT_TS =
`[[hs.init]]export function heapSort(a: number[]): void {[[/hs.init]]
  [[hs.init]]const n = a.length;[[/hs.init]]

  [[hs.build_heap]]buildMaxHeap(a, n);[[/hs.build_heap]]

  for (let end = n - 1; end > 0; end--) {
    [[hs.extract_max]]swap(a, 0, end);[[/hs.extract_max]]
    [[hs.extract_max]]siftDown(a, 0, end);[[/hs.extract_max]]
  }

  [[hs.done]]return;[[/hs.done]]
}

[[hs.build_heap]]function buildMaxHeap(a: number[], n: number): void {[[/hs.build_heap]]
  for (let i = parent(n - 1); i >= 0; i--) {
    [[hs.build_heap]]siftDown(a, i, n);[[/hs.build_heap]]
  }
}

[[hs.sift_start]]function siftDown(a: number[], start: number, heapSize: number): void {[[/hs.sift_start]]
  [[hs.sift_start]]let root = start;[[/hs.sift_start]]

  while (true) {
    [[hs.loop_check]]const left = leftChild(root);[[/hs.loop_check]]
    [[hs.loop_check]]if (left >= heapSize) return;[[/hs.loop_check]]

    [[hs.pick_left]]const child = left;[[/hs.pick_left]]
    [[hs.pick_left]]let swapIdx = root;[[/hs.pick_left]]

    [[hs.pick_left]]if (a[child] > a[swapIdx])[[/hs.pick_left]]
      [[hs.choose_swap_left]]swapIdx = child;[[/hs.choose_swap_left]]

    [[hs.has_right]]const right = child + 1;[[/hs.has_right]]
    [[hs.has_right]]const hasRight = right < heapSize;[[/hs.has_right]]

    if (hasRight) {
      [[hs.pick_right]]if (a[right] > a[swapIdx])[[/hs.pick_right]]
        [[hs.choose_swap_right]]swapIdx = right;[[/hs.choose_swap_right]]
    }

    [[hs.keep]]if (swapIdx === root) return;[[/hs.keep]]

    [[hs.swap]]swap(a, root, swapIdx);[[/hs.swap]]
    [[hs.swap]]root = swapIdx;[[/hs.swap]]
  }
}

function parent(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftChild(i: number): number {
  return 2 * i + 1;
}

function swap(a: number[], i: number, j: number): void {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}`;


export const HEAP_SORT_TS_TOKENS = {
  "hs.init": [1, 2],
  "hs.done": [9, 9],

  "hs.build_heap": [4, 7],
  "hs.extract_max": [6, 7],

  "hs.sift_start": [11, 12],
  "hs.loop_check": [15, 16],

  "hs.pick_left": [18, 21],
  "hs.choose_swap_left": [22, 22],

  "hs.has_right": [24, 25],
  "hs.pick_right": [28, 28],
  "hs.choose_swap_right": [29, 29],

  "hs.keep": [32, 32],
  "hs.swap": [34, 35],
} as const satisfies Record<string, [number, number]>;


export const HEAP_SORT_TS_POINTER_HINTS = {
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


export const HEAP_SORT_TS_POINTER_LABELS = {
  root: "root",
  child: "child",
  swap: "swap",
  end: "end",
} as const satisfies Record<string, string>;
