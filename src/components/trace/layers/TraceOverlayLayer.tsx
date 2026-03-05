// src/components/trace/layers/TraceOverlayLayer.tsx
import React from "react";
import type { TraceOverlay } from "../../../types/trace-types";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { LineChartOverlay } from "./LineChartOverlay";
import { ResidualChartOverlay } from "./ResidualChartOverlay";
import { SigmoidChartOverlay } from "./SigmoidChartOverlay";
import { VoronoiOverlay } from "./VoronoiOverlay";

export function TraceOverlayLayer({
  overlays,
  cellSize,
  colOffset,
  zIndex = 5,
}: {
  overlays: TraceOverlay[];
  cellSize: number;
  colOffset: number;
  zIndex?: number;
}) {
  const fx = useSettingsStore((s) => s.effectsEnabled);

  if (!overlays?.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex }}>
      {overlays.map((o) => {
        if (o.kind === "vline") {
          const x = (colOffset + o.x) * cellSize;
          const y1 = o.y1 * cellSize;
          const y2 = o.y2 * cellSize;

          const active = o.emphasis === "active";
          const strokeW = active ? 3 : 2;

          return (
            <div
              key={o.id}
              style={{
                position: "absolute",
                left: `${x}px`,
                top: `${Math.min(y1, y2)}px`,
                height: `${Math.max(1, Math.abs(y2 - y1))}px`,
                width: `${strokeW}px`,
                transform: `translateX(${-strokeW / 2}px)`,
                background: active
                  ? "rgb(var(--tn-accent) / 0.75)"
                  : "rgb(var(--tn-border) / 0.8)",
                opacity: active ? 0.9 : 0.55,
                borderRadius: `${Math.max(1, Math.round(strokeW / 2))}px`,
                filter: active && fx ? "drop-shadow(0 0 6px rgba(0,0,0,0.35))" : undefined,
              }}
            />
          );
        }

        if (o.kind === "caption") {
          const x = (colOffset + o.x) * cellSize;
          const y = o.y * cellSize;

          const soft = o.emphasis === "soft";
          const active = o.emphasis === "active";

          return (
            <div
              key={o.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: o.align === "center" ? "translate(-50%, -50%)"
                  : o.align === "right" ? "translate(-100%, -50%)"
                  : o.align === "below" ? "translateX(-50%)"
                  : "translateY(-50%)",
                maxWidth: 720,
                opacity: o.opacity,
                color: o.color,
              }}
              className={[
                "whitespace-nowrap",
                "text-xs",
                "select-none",
                "font-mono",
                soft ? "text-tn-muted/80" : active ? "text-tn-text" : "text-tn-muted",
              ].join(" ")}
            >
              {o.text}
            </div>
          );
        }

        if (o.kind === "text") {
          const gridLeftX = colOffset * cellSize;

          return (
            <div
              key={o.id}
              style={{
                position: "absolute",
                left: gridLeftX - 32,
                top: o.y * cellSize - 4,
                height: cellSize,
                width: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                fontSize: "var(--tn-fs-label)",
                color: "rgb(var(--tn-subtle) / 0.95)",
                fontFamily: "var(--font-mono)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {o.text}
            </div>
          );
        }

        if (o.kind === "linechart") {
          return (
            <LineChartOverlay
              key={o.id}
              x={o.x}
              y={o.y}
              width={o.width}
              height={o.height}
              points={o.points}
              yLabel={o.yLabel}
              refPoints={o.refPoints}
              refLabel={o.refLabel}
              anchorRight={o.anchorRight}
              cellSize={cellSize}
              colOffset={colOffset}
            />
          );
        }

        if (o.kind === "residualchart") {
          return (
            <ResidualChartOverlay
              key={o.id}
              x={o.x}
              y={o.y}
              width={o.width}
              height={o.height}
              residuals={o.residuals}
              highlightIdx={o.highlightIdx}
              cellSize={cellSize}
              colOffset={colOffset}
            />
          );
        }

        if (o.kind === "sigmoidchart") {
          return (
            <SigmoidChartOverlay
              key={o.id}
              x={o.x}
              y={o.y}
              width={o.width}
              height={o.height}
              dataPoints={o.dataPoints}
              highlightIdx={o.highlightIdx}
              cellSize={cellSize}
              colOffset={colOffset}
            />
          );
        }

        if (o.kind === "voronoi") {
          return (
            <VoronoiOverlay
              key={o.id}
              x={o.x}
              y={o.y}
              width={o.width}
              height={o.height}
              centroids={o.centroids}
              cellSize={cellSize}
              colOffset={colOffset}
            />
          );
        }

        if (o.kind === "band") {
          const top = o.y * cellSize - 2;
          const height = cellSize + 4;

          return (
            <div
              key={o.id}
              className="tn-active-band absolute left-0 right-0"
              style={{ top, height }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
