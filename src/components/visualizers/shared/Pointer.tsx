// src/components/visualizers/shared/Pointer.tsx
import React from "react";
import { getPointerStyle, getPointerArrowStyle } from "./pointerStyle";
import { useSettingsStore } from "../../../stores/useSettingsStore";

type Props = {
  x: number;
  y: number;
  label: string;
  color: string;
  cellSize: number;
  lane: "above" | "on" | "below" | "left" | "right";
};

export function Pointer({ x, y, label, color, cellSize, lane = "above" }: Props) {
  const fx = useSettingsStore((s) => s.effectsEnabled);
  const arrowDir =
    lane === "below" ? "up" :
    lane === "left" ? "right" :
    lane === "right" ? "left" :
    "down";

  const isHorizontal = lane === "left" || lane === "right";

  if (isHorizontal) {
    return (
      <div style={getPointerStyle(x, y, color, cellSize, lane)}>
        {lane === "right" ? (
          <>
            <div style={getPointerArrowStyle(color, arrowDir, cellSize, fx)} />
            <div>{label}</div>
          </>
        ) : (
          <>
            <div>{label}</div>
            <div style={getPointerArrowStyle(color, arrowDir, cellSize, fx)} />
          </>
        )}
      </div>
    );
  }

  const isBelow = lane === "below";

  return (
    <div style={getPointerStyle(x, y, color, cellSize, lane)}>
      {isBelow ? (
        <>
          <div style={getPointerArrowStyle(color, arrowDir, cellSize, fx)} />
          <div>{label}</div>
        </>
      ) : (
        <>
          <div>{label}</div>
          <div style={getPointerArrowStyle(color, arrowDir, cellSize, fx)} />
        </>
      )}
    </div>
  );
}
