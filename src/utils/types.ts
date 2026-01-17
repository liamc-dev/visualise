// src/utils/types.ts

export type AlgorithmStep<T> = {
  state: T;
  description: string;
  highlight: number[];
};

// ===== MERGE SORT TYPES =====

export type ActiveNode = {
  id: number;
  lo: number;
  hi: number;
  mid?: number;
  depth: number;
  phase:
  | "start"
  | "split"
  | "recurse-left"
  | "recurse-right"
  | "merge"
  | "write"
  | "end";
};

export interface MergeSortVisualState {
  array: number[];      // full array at this moment
  nodes: ActiveNode[];  // stack at this moment
}

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
  pivotIndex?: number;   // current pivot index in array
  scanIndex?: number;    // current j index while scanning
  boundaryIndex?: number;
};


export interface QuickSortVisualState {
  array: number[];
  nodes: QuickSortNode[];
}

// ===== MISC / OTHER =====

export type Props = {
  text: string;
};


// ===== SettingsStore =====
export type SettingsState = {
  glowEnabled: boolean;
  toggleGlow: () => void;
};
