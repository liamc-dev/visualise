// src/components/trace/layers/SigmoidChartOverlay.tsx
// SVG sigmoid curve with data point markers for logistic regression.

import React from "react";

type DataPt = { z: number; label: number; idx: number };

function sigmoid(z: number): number {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

export function SigmoidChartOverlay({
  x,
  y,
  width,
  height,
  dataPoints,
  highlightIdx,
  cellSize,
  colOffset,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  dataPoints: DataPt[];
  highlightIdx?: number;
  cellSize: number;
  colOffset: number;
}) {
  const fs = Math.max(6, Math.min(10, Math.round(cellSize * 0.26)));
  const left = (colOffset + x) * cellSize;
  const top = y * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;

  const pad = { top: 16, right: 12, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Determine z-range from data, with minimum spread
  const zValues = dataPoints.map((p) => p.z);
  const zDataMin = Math.min(...zValues, -1);
  const zDataMax = Math.max(...zValues, 1);
  const zMargin = Math.max((zDataMax - zDataMin) * 0.2, 1);
  const zMin = zDataMin - zMargin;
  const zMax = zDataMax + zMargin;
  const zRange = zMax - zMin || 1;

  const toSx = (z: number) => pad.left + ((z - zMin) / zRange) * plotW;
  const toSy = (p: number) => pad.top + (1 - p) * plotH;

  // Sample sigmoid curve
  const curveN = 60;
  const curvePts: string[] = [];
  for (let i = 0; i <= curveN; i++) {
    const z = zMin + (i / curveN) * zRange;
    curvePts.push(`${toSx(z)},${toSy(sigmoid(z))}`);
  }

  // Decision boundary at z=0
  const z0InRange = zMin <= 0 && zMax >= 0;

  const lineColor = "rgb(var(--tn-accent))";
  const mutedColor = "rgb(var(--tn-muted))";
  const gridColor = "rgb(var(--tn-border) / 0.3)";
  const class0Color = "rgb(var(--tn-cyan))";
  const class1Color = "rgb(var(--tn-warning))";

  // Y ticks: 0, 0.5, 1
  const yTicks = [0, 0.5, 1];
  // X ticks: spread across z range
  const xTicks = niceZTicks(zMin, zMax);

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
            stroke={gridColor} strokeWidth={1}
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
            {v}
          </text>
        ))}

        {/* X-axis tick labels */}
        {xTicks.map((z, i) => (
          <text
            key={`xt-${i}`}
            x={toSx(z)} y={h - pad.bottom + 14}
            textAnchor="middle"
            fill={mutedColor} fontSize={fs} fontFamily="var(--font-mono)"
          >
            {fmtTick(z)}
          </text>
        ))}

        {/* Y label */}
        <text
          x={8} y={pad.top + plotH / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={mutedColor} fontSize={fs} fontFamily="var(--font-mono)"
          transform={`rotate(-90, 8, ${pad.top + plotH / 2})`}
        >
          σ(z)
        </text>

        {/* Decision boundary at z=0 */}
        {z0InRange && (
          <line
            x1={toSx(0)} y1={pad.top}
            x2={toSx(0)} y2={pad.top + plotH}
            stroke={mutedColor} strokeWidth={1} strokeDasharray="3,3"
            opacity={0.5}
          />
        )}

        {/* Sigmoid curve */}
        <polyline
          points={curvePts.join(" ")}
          fill="none" stroke={lineColor}
          strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Data points on the curve */}
        {dataPoints.map((pt) => {
          const sx = toSx(pt.z);
          const sy = toSy(sigmoid(pt.z));
          const isHl = pt.idx === highlightIdx;
          return (
            <circle
              key={pt.idx}
              cx={sx} cy={sy}
              r={isHl ? 4 : 3}
              fill={pt.label === 0 ? class0Color : class1Color}
              opacity={isHl ? 1 : 0.7}
              stroke={isHl ? "rgb(var(--tn-text))" : "none"}
              strokeWidth={isHl ? 1 : 0}
            />
          );
        })}
      </svg>
    </div>
  );
}

function fmtTick(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

/** Pick 3–4 nice z-axis tick values. */
function niceZTicks(min: number, max: number): number[] {
  const range = max - min;
  const step = niceStep(range / 3);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 100) / 100);
    if (ticks.length >= 5) break;
  }
  return ticks;
}

function niceStep(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const norm = raw / mag;
  if (norm <= 1.5) return mag;
  if (norm <= 3.5) return 2 * mag;
  if (norm <= 7.5) return 5 * mag;
  return 10 * mag;
}
