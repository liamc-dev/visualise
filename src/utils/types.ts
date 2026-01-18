// src/utils/types.ts

/** Grid cell index (your current highlight representation). */
export type Highlight = number[];

/** A single visualisation step. */
export type AlgorithmStep<TState> = {
  state: TState;
  description: string;
  highlight: Highlight;
};

// ===== MERGE SORT TYPES =====

export type MergeSortPhase =
  | "start"
  | "split"
  | "recurse-left"
  | "recurse-right"
  | "merge"
  | "write"
  | "end";

export type MergeSortNode = {
  id: number;
  lo: number;
  hi: number;
  mid?: number;
  depth: number;
  phase: MergeSortPhase;
};

export type MergeSortVisualState = {
  array: number[];
  nodes: MergeSortNode[];
};

// ===== QUICK SORT TYPES =====

export type QuickSortPhase =
  | "start"
  | "partition"
  | "compare"
  | "recurse-left"
  | "recurse-right"
  | "pivot"
  | "swap"
  | "pivot-place"
  | "segment-sorted";

export type QuickSortNode = {
  id: number;
  lo: number;
  hi: number;
  depth: number;
  phase: QuickSortPhase;
  pivotIndex?: number;
  scanIndex?: number;
  boundaryIndex?: number;
};

export type QuickSortVisualState = {
  array: number[];
  nodes: QuickSortNode[];
};

// ===== Shared visual state union (used at the app boundary) =====

export type VisualState = MergeSortVisualState | QuickSortVisualState;
