import Grid from "../GridCanvas";
import { useThemeStore } from "../../stores/useThemeStore";
import PlayerControls from "../control/PlayerControls";
import PlayerControlsSynth from "../control/PlayerControlsSynth";
import { useVisualizer } from "../../hooks/useVisualizer";
import { ALGORITHMS, type Algorithm } from "../../algorithms/registry";

const INITIAL_ARRAY = [
  14, 3, 2, 13, 5, 1, 15, 12, 4, 8, 7, 9, 6, 11, 10, 20, 16, 19, 17, 18,
];

export default function Visualiser({ algorithm }: { algorithm: Algorithm }) {
  const {
    state,
    highlight,
    description,
    prevHighlight,
    isWriteStep,
    prevIsWriteStep,
    speedMs,
    layout,
  } = useVisualizer(INITIAL_ARRAY, algorithm);

  const { gridHeight, gridWidth, cellSize, width, height, colOffset } = layout;

  const theme = useThemeStore((s) => s.theme);
  const isControlSynth = theme === "tokyo-night";

  const Overlay = ALGORITHMS[algorithm].Overlay;

  return (
    <section
      className="
        rounded-2xl 
        border border-tn-border
        bg-tn-card/80 backdrop-blur-sm
        p-3 sm:p-4 md:p-5
      "
      style={{ width: "min-content", boxShadow: "var(--card-shadow)" }}
    >
      {isControlSynth ? <PlayerControlsSynth description={description} /> : <PlayerControls description={description} />}

      <div className="relative" style={{ width }}>
        <div className="relative flex-shrink-0" style={{ height }}>
          <Grid
            height={gridHeight}
            width={gridWidth}
            cellSize={cellSize}
            sweepSpeed={speedMs}
          />

          {Overlay && (
            <Overlay
              state={state}
              highlight={highlight}
              prevHighlight={prevHighlight}
              isWriteStep={isWriteStep}
              prevIsWriteStep={prevIsWriteStep}
              colOffset={colOffset}
              cellSize={cellSize}
            />
          )}
        </div>
      </div>
    </section>
  );
}
