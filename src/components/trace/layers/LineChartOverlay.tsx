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
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  yLabel?: string;
  cellSize: number;
  colOffset: number;
}) {
  if (points.length === 0) return null;

  const left = (colOffset + x) * cellSize;
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  // Padding inside the SVG for labels/ticks
  const pad = { top: 16, right: 12, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const epochs = points.map((p) => p.epoch);
  const values = points.map((p) => p.value);
  const xMin = Math.min(...epochs);
  const xMax = Math.max(...epochs);
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);
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

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
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
            x={pad.left - 4}
            y={toSy(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fill={mutedColor}
            fontSize={9}
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
            y={h - pad.bottom + 14}
            textAnchor="middle"
            fill={mutedColor}
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            {e}
          </text>
        ))}

        {/* Y label */}
        {yLabel && (
          <text
            x={8}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={mutedColor}
            fontSize={9}
            fontFamily="var(--font-mono)"
            transform={`rotate(-90, 8, ${pad.top + plotH / 2})`}
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

        {/* Current point dot */}
        <circle
          cx={toSx(last.epoch)}
          cy={toSy(last.value)}
          r={3}
          fill={lineColor}
        />
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
