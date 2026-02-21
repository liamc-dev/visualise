// src/components/visualizers/Visualizer.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import Grid from "../grid/GridCanvas";
import PlayerBar from "../control/PlayerBar";
import ControlsOverlay from "../control/ControlsOverlay";
import { ResizeHandle } from "../ui/ResizeHandle";
import { useControlsVisibility } from "../../hooks/use-controls-visibility";
import { useMeasure } from "../../hooks/use-measure";
import { useGridLayout } from "../../hooks/use-grid-layout";
import { useSettingsStore } from "../../stores/useSettingsStore";
import TraceRenderer from "../trace/TraceRenderer";
import type { TraceScene, TraceFocus } from "../../types/trace-types";

type VisualizerProps = {
  id?: string;
  scene: TraceScene;
  focus?: TraceFocus;
  description: string;
  speedMs: number;
  domainSize: number;
  contentWidthCols?: number;
  contentHeightRows?: number;
};

const GRID_W = 26;
const DEFAULT_PANEL_ROWS = 20;
const MIN_PANEL_ROWS = 4;
const CONTROLS_PAD_ROWS = 3; // extra rows so the overlay doesn't cover bottom content
const SCROLL_PAD_PX = 32;    // p-3/p-4 top+bottom padding on the scroll container

const AUTO_CENTER_PAD_COLS = 2;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function computeBoundsCenteringColOffset(scene: TraceScene, gridWidthCols: number) {
  const b = scene.bounds;
  if (!b) return null;

  const minX = b.minX - AUTO_CENTER_PAD_COLS;
  const maxX = b.maxX + AUTO_CENTER_PAD_COLS;

  const contentWidth = Math.max(1, maxX - minX);
  const contentCenterX = minX + contentWidth / 2;
  const viewportCenterX = gridWidthCols / 2;

  return clamp(viewportCenterX - contentCenterX, -gridWidthCols, gridWidthCols);
}

export default function Visualizer({
  id,
  scene,
  focus,
  speedMs,
  description,
  domainSize,
  contentWidthCols,
  contentHeightRows,
}: VisualizerProps) {
  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const { ref, size } = useMeasure<HTMLDivElement>(8);
  const measured = size.width > 0;
  const { visible, containerHandlers } = useControlsVisibility();

  // How many rows the trace content actually needs
  const contentRows = Math.max(1, (contentHeightRows ?? 0) + CONTROLS_PAD_ROWS);

  // Panel rows — stored as rows so it scales with cellSize on viewport resize
  const [panelRows, setPanelRows] = useState(DEFAULT_PANEL_ROWS);

  useEffect(() => {
    setPanelRows(DEFAULT_PANEL_ROWS);
  }, [id]);

  // We only need cellSize, gridWidth, colOffset from the layout hook
  const { gridWidth, cellSize, colOffset } = useGridLayout({
    viewport: { width: measured ? size.width : 1 },
    gridWidth: GRID_W,
    gridHeight: DEFAULT_PANEL_ROWS,
    rootLength: domainSize,
    contentWidthCols,
  });

  // Grid canvas fills whichever is taller — always present, never empty void
  const gridRows = Math.max(contentRows, Math.ceil(panelRows));
  const panelHeight = cellSize * panelRows;
  const innerHeight = cellSize * gridRows;

  // --- Resize: DOM-only during drag, commit to state on release ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragHeightRef = useRef(panelHeight);
  const isDraggingRef = useRef(false);

  // Keep ref in sync with committed state — but not while dragging
  if (!isDraggingRef.current) {
    dragHeightRef.current = panelHeight;
  }

  const onDrag = useCallback(
    (deltaY: number) => {
      isDraggingRef.current = true;
      const minH = cellSize * MIN_PANEL_ROWS;
      dragHeightRef.current = Math.max(minH, dragHeightRef.current + deltaY);
      if (scrollRef.current) {
        scrollRef.current.style.height = `${dragHeightRef.current + SCROLL_PAD_PX}px`;
      }
    },
    [cellSize],
  );

  const onCommit = useCallback(() => {
    isDraggingRef.current = false;
    setPanelRows(Math.max(MIN_PANEL_ROWS, dragHeightRef.current / cellSize));
  }, [cellSize]);

  const boundsOffset = computeBoundsCenteringColOffset(scene, gridWidth);
  const effectiveColOffset = boundsOffset ?? colOffset;

  return (
    <div ref={ref} className="block min-w-0 w-full">
      <div className="w-full max-w-full" style={{ opacity: measured ? 1 : 0 }}>
        <section
          className="
            relative block w-full max-w-full rounded-st-xl
            border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-tn-border bg-tn-grid backdrop-blur-[var(--st-blur-sm)]
            shadow-st-card
          "
          onMouseEnter={containerHandlers.onMouseEnter}
          onMouseMove={containerHandlers.onMouseMove}
          onMouseLeave={containerHandlers.onMouseLeave}
        >
          <div
            ref={scrollRef}
            className={`p-3 sm:p-4 w-full max-w-full overflow-x-hidden ${contentRows > panelRows ? "overflow-y-auto" : "overflow-y-hidden"}`}
            style={{ height: panelHeight + SCROLL_PAD_PX }}
          >
            <div className="w-full">
              <div
                className={`relative${effectsEnabled ? "" : " tn-no-anim"}`}
                style={{ height: innerHeight }}
              >
                <Grid
                  height={gridRows}
                  width={gridWidth}
                  cellSize={cellSize}
                  sweepSpeed={speedMs}
                />

                <TraceRenderer
                  scene={scene}
                  focus={focus}
                  cellSize={cellSize}
                  colOffset={effectiveColOffset}
                />
              </div>
            </div>
          </div>

          <ControlsOverlay visible={visible} />
        </section>

        <ResizeHandle onDrag={onDrag} onCommit={onCommit} />

        <PlayerBar description={description} />
      </div>
    </div>
  );
}
