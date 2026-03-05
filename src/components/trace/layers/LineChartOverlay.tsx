// src/components/trace/layers/LineChartOverlay.tsx
// SVG mini line chart for loss/metric curves in ML algorithm traces.

import React from "react";

type Point = { epoch: number; value: number };

export function LineChartOverlay({
  x,
  y,
  width,
  height,
  points,
  yLabel,
  refPoints,
  refLabel,
  anchorRight,
  anchorLeft,
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  yLabel?: string;
  refPoints?: Point[];
  refLabel?: string;
  anchorRight?: boolean;
  anchorLeft?: boolean;
  cellSize: number;
  colOffset: number;
}) {
  if (points.length === 0) return null;

  const fs = Math.max(6, Math.min(10, Math.round(cellSize * 0.26)));
  const fsSmall = Math.max(6, Math.min(9, Math.round(cellSize * 0.22)));
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  // Scale padding proportionally to cellSize so chart stays readable at small viewports
  const s = Math.max(0.4, cellSize / 40);
  const pad = {
    top: Math.round(16 * s),
    right: Math.round((refLabel ? 56 : 12) * s),
    bottom: Math.round(20 * s),
    left: Math.round(36 * s),
  };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Combine points and refPoints for shared axis scaling
  const allValues = points.map((p) => p.value);
  if (refPoints?.length) {
    for (const rp of refPoints) allValues.push(rp.value);
  }

  const epochs = points.map((p) => p.epoch);
  const xMin = Math.min(...epochs);
  const xMax = Math.max(...epochs);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const toSx = (e: number) => pad.left + ((e - xMin) / xRange) * plotW;
  const toSy = (v: number) => pad.top + (1 - (v - yMin) / yRange) * plotH;

  // Build polyline
  const polyline = points.map((p) => `${toSx(p.epoch)},${toSy(p.value)}`).join(" ");
  const last = points[points.length - 1];

  // Y-axis ticks (3 ticks: min, mid, max)
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  // X-axis ticks: first and last epoch
  const xTicks = xMin === xMax ? [xMin] : [xMin, xMax];

  const lineColor = "rgb(var(--tn-accent))";
  const mutedColor = "rgb(var(--tn-muted))";
  const gridColor = "rgb(var(--tn-border) / 0.3)";

  const posStyle = anchorRight
    ? { right: x * cellSize, top }
    : anchorLeft
    ? { left: x * cellSize, top }
    : { left: (colOffset + x) * cellSize, top };

  return (
    <div
      style={{
        position: "absolute",
        ...posStyle,
        width: w,
        height: h,
        pointerEvents: "none",
      }}
    >
      <svg width={w} height={h} className="overflow-visible">
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <line
            key={`yg-${i}`}
            x1={pad.left}
            y1={toSy(v)}
            x2={w - pad.right}
            y2={toSy(v)}
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}

        {/* Y-axis tick labels */}
        {yTicks.map((v, i) => (
          <text
            key={`yt-${i}`}
            x={pad.left - 3 * s}
            y={toSy(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fill={mutedColor}
            fontSize={fs}
            fontFamily="var(--font-mono)"
          >
            {formatTick(v)}
          </text>
        ))}

        {/* X-axis tick labels */}
        {xTicks.map((e, i) => (
          <text
            key={`xt-${i}`}
            x={toSx(e)}
            y={h - pad.bottom + 12 * s}
            textAnchor="middle"
            fill={mutedColor}
            fontSize={fs}
            fontFamily="var(--font-mono)"
          >
            {e}
          </text>
        ))}

        {/* Y label */}
        {yLabel && (
          <text
            x={6 * s}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={mutedColor}
            fontSize={fs}
            fontFamily="var(--font-mono)"
            transform={`rotate(-90, ${6 * s}, ${pad.top + plotH / 2})`}
          >
            {yLabel}
          </text>
        )}

        {/* Polyline */}
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Reference line (dashed, muted) */}
        {refPoints && refPoints.length >= 2 && (
          <polyline
            points={refPoints.map((p) => `${toSx(p.epoch)},${toSy(p.value)}`).join(" ")}
            fill="none"
            stroke={mutedColor}
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
        )}

        {/* Current point dot */}
        <circle
          cx={toSx(last.epoch)}
          cy={toSy(last.value)}
          r={Math.max(2, 3 * s)}
          fill={lineColor}
        />

        {/* Legend */}
        {refLabel && (
          <g transform={`translate(${w - pad.right + 5 * s}, ${pad.top + 3 * s})`}>
            <line x1={0} y1={0} x2={10 * s} y2={0} stroke={lineColor} strokeWidth={1.5} />
            <text x={13 * s} y={0} dominantBaseline="middle" fill={lineColor} fontSize={fsSmall} fontFamily="var(--font-mono)">
              ops
            </text>
            <line x1={0} y1={12 * s} x2={10 * s} y2={12 * s} stroke={mutedColor} strokeWidth={1} strokeDasharray="4 3" />
            <text x={13 * s} y={12 * s} dominantBaseline="middle" fill={mutedColor} fontSize={fsSmall} fontFamily="var(--font-mono)">
              {refLabel}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 1) return v.toFixed(1);
  if (Math.abs(v) >= 0.01) return v.toFixed(2);
  return v.toFixed(3);
}
