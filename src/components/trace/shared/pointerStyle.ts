// src/components/visualizers/shared/pointerStyle.ts
import React from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getPointerStyle(
  x: number,
  y: number,
  color: string,
  cellSize: number,
  lane: "above" | "on" | "below" | "left" | "right" = "above",
) {
  const fontSize = clamp(Math.round(cellSize * 0.34), 10, 16);
  const isHorizontal = lane === "left" || lane === "right";

  // Horizontal: row layout, vertical centering
  // Vertical: column layout, horizontal centering
  const transform = isHorizontal
    ? lane === "left"
      ? `translate(${x}px, ${y}px) translate(-100%, -50%)`
      : `translate(${x}px, ${y}px) translateY(-50%)`
    : `translate(${x}px, ${y}px) translateX(-50%)`;

  return {
    position: "absolute",
    transform,
    pointerEvents: "none",
    zIndex: 8,
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    alignItems: "center",
    gap: isHorizontal ? 2 : 0,
    fontSize,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color,
    textShadow: "var(--tn-overlay-textshadow)",
    transition: `
      transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease
    `,
  } as React.CSSProperties;
}

export function getPointerArrowStyle(
  color: string,
  dir: "down" | "up" | "left" | "right" = "down",
  cellSize: number,
  effectsEnabled = true,
) {
  const halfBase = cellSize * 0.22;
  const height = cellSize * 0.32;
  const offset = cellSize * 0.12;

  const shadow = effectsEnabled ? "drop-shadow(var(--tn-overlay-inset))" : undefined;
  const isHorizontal = dir === "left" || dir === "right";

  if (isHorizontal) {
    const common: React.CSSProperties = {
      width: 0,
      height: 0,
      borderTop: `${halfBase}px solid transparent`,
      borderBottom: `${halfBase}px solid transparent`,
      filter: shadow,
      transform: `translateX(${dir === "left" ? -offset : offset}px)`,
    };

    if (dir === "left") {
      return { ...common, borderRight: `${height}px solid ${color}` };
    }
    return { ...common, borderLeft: `${height}px solid ${color}` };
  }

  // Vertical arrows (existing)
  const common: React.CSSProperties = {
    width: 0,
    height: 0,
    borderLeft: `${halfBase}px solid transparent`,
    borderRight: `${halfBase}px solid transparent`,
    filter: shadow,
    transform: `translateY(${dir === "up" ? -offset : offset}px)`,
  };

  if (dir === "up") {
    return { ...common, borderBottom: `${height}px solid ${color}` };
  }
  return { ...common, borderTop: `${height}px solid ${color}` };
}
