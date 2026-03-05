// src/components/trace/layers/ResidualChartOverlay.tsx
// SVG residual plot showing per-point errors around a zero line.

import React from "react";

type Residual = { idx: number; value: number };

export function ResidualChartOverlay({
  x,
  y,
  width,
  height,
  residuals,
  highlightIdx,
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  residuals: Residual[];
  highlightIdx?: number;
  cellSize: number;
  colOffset: number;
}) {
  if (residuals.length === 0) return null;

  const fs = Math.max(6, Math.min(10, Math.round(cellSize * 0.26)));
  const left = (colOffset + x) * cellSize;
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  const pad = { top: 16, right: 12, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const n = residuals.length;
  const values = residuals.map((r) => r.value);
  const absMax = Math.max(...values.map(Math.abs), 0.1);
  // Symmetric y range around zero
  const yMax = absMax;
  const yMin = -absMax;

  const toSx = (i: number) => pad.left + ((i + 0.5) / n) * plotW;
  const toSy = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const zeroY = toSy(0);

  const mutedColor = "rgb(var(--tn-muted))";
  const gridColor = "rgb(var(--tn-border) / 0.3)";
  const accentColor = "rgb(var(--tn-accent))";
  const warningColor = "rgb(var(--tn-warning))";
  const dangerColor = "rgb(var(--tn-danger))";

  // Y ticks: -max, 0, +max
  const yTicks = [yMin, 0, yMax];

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
            x1={pad.left} y1={toSy(v)}
            x2={w - pad.right} y2={toSy(v)}
            stroke={v === 0 ? mutedColor : gridColor}
            strokeWidth={v === 0 ? 1 : 1}
            opacity={v === 0 ? 0.6 : 1}
          />
        ))}

        {/* Y-axis tick labels */}
        {yTicks.map((v, i) => (
          <text
            key={`yt-${i}`}
            x={pad.left - 4} y={toSy(v)}
            textAnchor="end" dominantBaseline="middle"
            fill={mutedColor} fontSize={fs} fontFamily="var(--font-mono)"
          >
            {fmtTick(v)}
          </text>
        ))}

        {/* Y label */}
        <text
          x={8} y={pad.top + plotH / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={mutedColor} fontSize={fs} fontFamily="var(--font-mono)"
          transform={`rotate(-90, 8, ${pad.top + plotH / 2})`}
        >
          y−ŷ
        </text>

        {/* Residual bars + dots */}
        {residuals.map((r) => {
          const sx = toSx(r.idx);
          const sy = toSy(r.value);
          const isHl = r.idx === highlightIdx;
          const relErr = absMax > 0 ? Math.abs(r.value) / absMax : 0;
          const color = relErr < 0.3 ? accentColor : relErr < 0.6 ? warningColor : dangerColor;

          return (
            <React.Fragment key={r.idx}>
              <line
                x1={sx} y1={zeroY}
                x2={sx} y2={sy}
                stroke={color} strokeWidth={isHl ? 2 : 1}
                opacity={isHl ? 0.9 : 0.5}
              />
              <circle
                cx={sx} cy={sy}
                r={isHl ? 4 : 3}
                fill={color}
                opacity={isHl ? 1 : 0.7}
                stroke={isHl ? "rgb(var(--tn-text))" : "none"}
                strokeWidth={isHl ? 1 : 0}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}

function fmtTick(v: number): string {
  if (v === 0) return "0";
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
