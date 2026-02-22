// src/components/visualizers/shared/TreeOverlay.tsx
import React, { useId } from "react";

export type TreePoint = { x: number; y: number };

export type TreeEdge = {
  from: TreePoint;
  to: TreePoint;

  opacity?: number;
  dashed?: boolean;
  active?: boolean;

  via?: TreePoint | TreePoint[];
  curveVia?: TreePoint;

  arrow?: boolean;
  color?: string;
};

type Props = { edges: TreeEdge[]; zIndex?: number };

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function buildQuadraticPath(from: TreePoint, ctrl: TreePoint, to: TreePoint) {
  return `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`;
}

function buildRoundedPath(from: TreePoint, via: TreePoint[], to: TreePoint, radius = 10) {
  const pts = [from, ...via, to];
  if (pts.length < 2) return "";

  const dist = (a: TreePoint, b: TreePoint) => Math.hypot(b.x - a.x, b.y - a.y);

  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const d1 = dist(prev, curr);
    const d2 = dist(curr, next);
    const r = Math.max(0, Math.min(radius, d1 / 2, d2 / 2));

    const ux1 = (curr.x - prev.x) / (d1 || 1);
    const uy1 = (curr.y - prev.y) / (d1 || 1);
    const ux2 = (next.x - curr.x) / (d2 || 1);
    const uy2 = (next.y - curr.y) / (d2 || 1);

    const p1 = { x: curr.x - ux1 * r, y: curr.y - uy1 * r };
    const p2 = { x: curr.x + ux2 * r, y: curr.y + uy2 * r };

    d += ` L ${p1.x} ${p1.y}`;

    const cross = ux1 * uy2 - uy1 * ux2;
    const sweepFlag = cross < 0 ? 0 : 1;

    d += ` A ${r} ${r} 0 0 ${sweepFlag} ${p2.x} ${p2.y}`;
  }

  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
}

export function TreeOverlay({ edges, zIndex = 0 }: Props) {
  const markerId = `tn-arrow-${useId()}`;

  if (!edges.length) return null;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex,
        overflow: "visible",
      }}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
          markerUnits="strokeWidth"
          overflow="visible"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" stroke="context-stroke" />

        </marker>
      </defs>

      {edges.map((e, idx) => {
        const opacity = e.opacity ?? 0.28;

        const color =
          e.color ??
          (e.active
            ? "rgb(var(--tn-accent) / 0.70)"
            : "rgb(var(--tn-accent) / 0.55)");

        const strokeWidth = e.active ? 2.25 : 1.5;

        const via = asArray(e.via);
        const ctrl = e.curveVia;

        const markerEnd = e.arrow ? `url(#${markerId})` : undefined;

        if (ctrl) {
          const d = buildQuadraticPath(e.from, ctrl, e.to);
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={e.dashed ? "5 6" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              markerEnd={markerEnd}
            />
          );
        }

        if (via.length === 0) {
          return (
            <line
              key={idx}
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={e.dashed ? "5 6" : undefined}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              markerEnd={markerEnd}
            />
          );
        }

        const d = buildRoundedPath(e.from, via, e.to, 10);

        return (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
            strokeDasharray={e.dashed ? "5 6" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            markerEnd={markerEnd}
          />
        );
      })}
    </svg>
  );
}
