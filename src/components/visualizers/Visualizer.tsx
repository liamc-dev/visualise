// src/components/visualizers/Visualizer.tsx
import React from "react";
import Grid from "../grid/GridCanvas";
import PlayerBar from "../control/PlayerBar";
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
};

const GRID_W = 26;
const GRID_H = 20;

const AUTO_CENTER_PAD_COLS = 2;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function computeBoundsCenteringColOffset(scene: TraceScene, gridWidthCols: number) {
  const b = scene.bounds;
  if (!b) return null;

  // Expand bounds a bit so the centered result doesn't look cramped
  const minX = b.minX - AUTO_CENTER_PAD_COLS;
  const maxX = b.maxX + AUTO_CENTER_PAD_COLS;

  const contentWidth = Math.max(1, maxX - minX);
  const contentCenterX = minX + contentWidth / 2;

  const viewportCenterX = gridWidthCols / 2;

  // shift so content center aligns to viewport center
  // NOTE: colOffset is in "grid cols"
  let offset = viewportCenterX - contentCenterX;

  // Clamp to avoid extreme shifts if bounds are weird
  offset = clamp(offset, -gridWidthCols, gridWidthCols);

  return offset;
}

export default function Visualizer({
  scene,
  focus,
  speedMs,
  description,
  domainSize,
  contentWidthCols,
}: VisualizerProps) {
  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const { ref, size } = useMeasure<HTMLDivElement>(8);
  const measured = size.width > 0;

  const layout = useGridLayout({
    viewport: { width: measured ? size.width : 1 },
    gridWidth: GRID_W,
    gridHeight: GRID_H,
    rootLength: domainSize,
    contentWidthCols,
  });
  
  const { gridHeight, gridWidth, cellSize, height, colOffset } = layout;

  const boundsOffset = computeBoundsCenteringColOffset(scene, gridWidth);
  const effectiveColOffset = boundsOffset ?? colOffset;

  return (
    <div ref={ref} className="block min-w-0 w-full">
      <div className="w-full max-w-full" style={{ opacity: measured ? 1 : 0 }}>
        <section
          className="
            relative block w-full max-w-full rounded-2xl
            border border-tn-border bg-tn-grid backdrop-blur-sm
            p-3 sm:p-4
          "
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="w-full max-w-full overflow-hidden">
            <div className="w-full">
              <div className={`relative pb-20${effectsEnabled ? "" : " tn-no-anim"}`} style={{ height }}>
                <Grid
                  height={gridHeight}
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

          <PlayerBar description={description} />
        </section>
      </div>
    </div>
  );
}
