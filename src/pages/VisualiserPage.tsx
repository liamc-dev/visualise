// src/pages/VisualiserPage.tsx
import { useParams, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Visualiser from "../components/visualizers/Visualiser";
import AlgoInfoPanel from "../components/AlgoInfoPanel";

import MergeSortLogo from "../assets/mergesort-palm.png";
import QuickSortLogo from "../assets/mergesort-palm.png";

type AlgoParam = "merge-sort" | "quick-sort" | "bubble-sort";
type AlgoKey = "merge" | "quick" | "bubble";

const algoConfig: Record<
  AlgoParam,
  {
    key: AlgoKey;
    title: string;
    logo: string;
    description: ReactNode;
  }
> = {
  "merge-sort": {
    key: "merge",
    title: "Merge Sort",
    logo: MergeSortLogo,
    description: (
      <>
        Merge Sort recursively splits the array into halves, sorts each half,
        then merges them back together in order. It guarantees{" "}
        <strong>O(n log n)</strong> time complexity and is stable.
      </>
    ),
  },

  "quick-sort": {
    key: "quick",
    title: "Quick Sort",
    logo: QuickSortLogo,
    description: (
      <>
        Quick Sort selects a pivot and partitions the array so that elements
        smaller than the pivot come before it and larger ones after. It is
        extremely fast in practice but not stable.
      </>
    ),
  },

  "bubble-sort": {
    key: "bubble",
    title: "Bubble Sort",
    logo: MergeSortLogo, // placeholder
    description: (
      <>
        Bubble Sort repeatedly swaps adjacent elements if they are in the wrong
        order. It is simple but inefficient, with{" "}
        <strong>O(n²)</strong> time complexity.
      </>
    ),
  },
};

export default function VisualiserPage() {
  const { algorithm } = useParams<{ algorithm: AlgoParam }>();

  if (!algorithm || !(algorithm in algoConfig)) {
    return <Navigate to="/visualiser/merge-sort" replace />;
  }

  const algo = algoConfig[algorithm];

  return (
    <div className="px-0 py-0 text-tn-text">
      <div
        className="
          grid gap-6 
          lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]
        "
      >
        {/* Visualiser */}
        <Visualiser algorithm={algo.key} />

        {/* Algo info */}
        <AlgoInfoPanel
          logoSrc={algo.logo}
          logoAlt={`${algo.title} Hero Artwork`}
          title={algo.title}
          description={algo.description}
          bullets={[
            "Step-by-step execution with playback controls",
            "Depth-aware visual overlays",
            "Designed for performance and clarity",
          ]}
        />
      </div>
    </div>
  );
}
