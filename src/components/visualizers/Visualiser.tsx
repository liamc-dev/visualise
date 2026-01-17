// src/components/visualizers/Visualiser.tsx
import Grid from "../GridCanvas";
import PlayerControls from "../control/PlayerControls";
import { MergeSortOverlay } from "./MergeSortOverlay";
import { QuickSortOverlay } from "./QuickSortOverlay";
import { MergeSortVisualState, QuickSortVisualState } from "../../utils/types";
import { useVisualizer } from "../../hooks/useVisualizer";
import CrtFxToggle from "../control/CrtFxToggle";

const INITIAL_ARRAY = [
  14, 3, 2, 13, 5, 1, 15, 12, 4, 8, 7, 9, 6, 11, 10, 20, 16, 19, 17, 18,
];

type AlgoKey = "merge" | "quick" | "bubble";

export default function Visualiser({ algorithm }: { algorithm: AlgoKey }) {
  const {
    steps,
    state,
    description,
    highlight,
    prevHighlight,
    isWriteStep,
    prevIsWriteStep,
    speedMs,
    layout,
  } = useVisualizer(INITIAL_ARRAY, algorithm);

  const { gridHeight, gridWidth, cellSize, width, height, colOffset } = layout;

  const isMergeSort = algorithm === "merge";
  const isQuickSort = algorithm === "quick";

  return (
    <section
      className="
        rounded-2xl 
        border border-tn-border
        bg-tn-card/80 backdrop-blur-sm
        p-3 sm:p-4 md:p-5
        shadow-[0_0_30px_rgba(0,0,0,0.55)]
      "
      style={{ width: "min-content" }}
    >
      <div className="flex justify-end mb-4">
        <CrtFxToggle />
      </div>

      <PlayerControls />

      <div className="relative" style={{ width }}>
        {/* <DescriptionBar text={description} /> */}

        <div className="relative flex-shrink-0" style={{ height }}>
          <Grid
            height={gridHeight}
            width={gridWidth}
            cellSize={cellSize}
            sweepSpeed={speedMs}
          />

          {isMergeSort && (
            <MergeSortOverlay
              state={state as MergeSortVisualState}
              highlight={highlight}
              prevHighlight={prevHighlight}
              isWriteStep={isWriteStep}
              prevIsWriteStep={prevIsWriteStep}
              colOffset={colOffset}
              cellSize={cellSize}
            />
          )}

          {isQuickSort && (
            <QuickSortOverlay
              state={state as QuickSortVisualState}
              highlight={highlight}
              prevHighlight={prevHighlight}
              isWriteStep={isWriteStep}
              prevIsWriteStep={prevIsWriteStep}
              colOffset={colOffset}
              cellSize={cellSize}
            />
          )}

          {/* bubble later */}
        </div>
      </div>
    </section>
  );
}
