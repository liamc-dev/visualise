import type { ReactNode, ComponentType } from "react";
import type { Theme } from "../stores/useThemeStore";

import { mergeSortSteps } from "./sorting/mergeSort";
import { quickSortSteps } from "./sorting/quickSort";

import { MergeSortOverlay } from "../components/visualizers/MergeSortOverlay";
import { QuickSortOverlay } from "../components/visualizers/QuickSortOverlay";

import MergeSortLogoLight from "../assets/mergesort-palm.png";
import MergeSortLogoDark from "../assets/mergesort-palm.png";

import QuickSortLogoLight from "../assets/mergesort-palm.png";
import QuickSortLogoDark from "../assets/mergesort-palm.png";

import type { AlgorithmStep, VisualState, Highlight } from "../utils/types";

export type OverlayProps = {
  state: VisualState;
  highlight: Highlight;
  prevHighlight: Highlight;
  isWriteStep: boolean;
  prevIsWriteStep: boolean;
  colOffset: number;
  cellSize: number;
};

export type ThemedLogo = Partial<Record<Theme, string>>;

export type AlgorithmDef = {
  label: string;
  category: "Sorting" | "Pathfinding" | "Graphs" | "Other";
  steps: (arr: number[]) => AlgorithmStep<VisualState>[];
  Overlay?: ComponentType<OverlayProps>;

  // UI meta
  logos?: ThemedLogo;
  description?: ReactNode;
  bullets?: string[];
};

export const ALGORITHMS = {
  "merge-sort": {
    label: "Merge Sort",
    category: "Sorting",
    steps: (arr) => mergeSortSteps(arr) as unknown as AlgorithmStep<VisualState>[],
    Overlay: MergeSortOverlay as unknown as ComponentType<OverlayProps>,

    logos: {
      light: MergeSortLogoLight,
      dark: MergeSortLogoDark,
      "tokyo-night": MergeSortLogoDark, // reuse dark until you have a tokyo asset
    },

    description: (
      <>
        Merge Sort recursively splits the array into halves, sorts each half,
        then merges them back together in order. It guarantees{" "}
        <strong>O(n log n)</strong> time complexity and is stable.
      </>
    ),

    bullets: [
      "Step-by-step execution with playback controls",
      "Depth-aware visual overlays",
      "Designed for performance and clarity",
    ],
  },

  "quick-sort": {
    label: "Quick Sort",
    category: "Sorting",
    steps: (arr) => quickSortSteps(arr) as unknown as AlgorithmStep<VisualState>[],
    Overlay: QuickSortOverlay as unknown as ComponentType<OverlayProps>,

    logos: {
      light: QuickSortLogoLight,
      dark: QuickSortLogoDark,
      "tokyo-night": QuickSortLogoDark,
    },

    description: (
      <>
        Quick Sort selects a pivot and partitions the array so that elements
        smaller than the pivot come before it and larger ones after. It is
        extremely fast in practice but not stable.
      </>
    ),

    bullets: [
      "Step-by-step execution with playback controls",
      "Depth-aware visual overlays",
      "Designed for performance and clarity",
    ],
  },
} as const satisfies Record<string, AlgorithmDef>;

export type Algorithm = keyof typeof ALGORITHMS;
