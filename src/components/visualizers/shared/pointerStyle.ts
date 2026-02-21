// src/components/visualizers/shared/pointerStyle.ts
import React from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getPointerStyle(x: number, y: number, color: string, cellSize: number) {
  const fontSize = clamp(Math.round(cellSize * 0.34), 10, 16);

  return {
    position: "absolute",
    transform: `translate(${x}px, ${y}px) translateX(-50%)`,
    pointerEvents: "none",
    zIndex: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
  dir: "down" | "up" = "down",
  cellSize: number
) {
  const halfBase = cellSize * 0.22;
  const height = cellSize * 0.32;
  const offset = cellSize * 0.12;

  const common: React.CSSProperties = {
    width: 0,
    height: 0,
    borderLeft: `${halfBase}px solid transparent`,
    borderRight: `${halfBase}px solid transparent`,
    filter: "drop-shadow(var(--tn-overlay-inset))",
    transform: `translateY(${dir === "up" ? -offset : offset}px)`,
  };

  if (dir === "up") {
    return {
      ...common,
      borderBottom: `${height}px solid ${color}`,
    };
  }

  return {
    ...common,
    borderTop: `${height}px solid ${color}`,
  };
}