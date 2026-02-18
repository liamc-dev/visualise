// src/components/visualizers/shared/Pointer.tsx
import React from "react";
import { getPointerStyle, getPointerArrowStyle } from "./pointerStyle";

type Props = {
  x: number;
  y: number;
  label: string;
  color: string;
  cellSize: number;
  lane: "above" | "on" | "below";
};

export function Pointer({ x, y, label, color, cellSize, lane = "above" }: Props) {
  const isBelow = lane === "below";
  const arrowDir = isBelow ? "up" : "down";
  
  return (
    <div style={getPointerStyle(x, y, color, cellSize)}>
      {isBelow ? (
        <>
          <div style={getPointerArrowStyle(color, arrowDir, cellSize)} />
          <div>{label}</div>
        </>
      ) : (
        <>
          <div>{label}</div>
          <div style={getPointerArrowStyle(color, arrowDir, cellSize)} />
        </>
      )}
    </div>
  );
}
