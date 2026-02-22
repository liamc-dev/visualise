// src/hooks/use-grid-layout.ts
import { useEffect, useMemo, useState } from "react";

type Viewport = { width?: number; height?: number };

type GridLayout = {
  gridHeight: number;
  gridWidth: number;
  cellSize: number;
  width: number;
  height: number;
  colOffset: number;
};

type Params = {
  viewport?: Viewport;
  gridWidth: number;
  gridHeight: number;

  // Back-compat: old name
  rootLength: number;

  // New name: preferred for scenes / generic traces
  contentWidthCols?: number;

  maxCell?: number;
  minCell?: number;
  hardMinCell?: number;
  paddingX?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function useGridLayout({
  viewport,
  gridWidth,
  gridHeight,
  rootLength,
  contentWidthCols,
  maxCell = 48,
  minCell = 10,
  hardMinCell = 2,
  paddingX = 26,
}: Params): GridLayout {
  const [lastGoodCell, setLastGoodCell] = useState(26);
  const measuredW = viewport?.width ?? 0;

  const layout = useMemo(() => {
    const contentCols =
      typeof contentWidthCols === "number" && Number.isFinite(contentWidthCols)
        ? Math.max(0, contentWidthCols)
        : Math.max(0, rootLength);

    const colOffset = Math.max(0, Math.floor((gridWidth - contentCols) / 2));

    if (measuredW <= 1) {
      const cellSize = lastGoodCell;

      return {
        gridHeight,
        gridWidth,
        cellSize,
        width: cellSize * gridWidth,
        height: cellSize * gridHeight,
        colOffset,
      };
    }

    const availW = Math.max(0, measuredW - paddingX);
    const snappedAvailW = Math.floor(availW);

    const fitCell = snappedAvailW / gridWidth;

    const cellSize =
      fitCell >= minCell
        ? clamp(fitCell, minCell, maxCell)
        : clamp(fitCell, hardMinCell, minCell);

    return {
      gridHeight,
      gridWidth,
      cellSize,
      width: Math.ceil(cellSize * gridWidth) + 1,
      height: Math.ceil(cellSize * gridHeight),
      colOffset,
    };
  }, [
    measuredW,
    gridWidth,
    gridHeight,
    rootLength,
    contentWidthCols,
    maxCell,
    minCell,
    hardMinCell,
    paddingX,
    lastGoodCell,
  ]);

  // Persist lastGoodCell after render when we get a valid measurement
  useEffect(() => {
    if (layout.cellSize >= minCell) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastGoodCell((prev) => (prev === layout.cellSize ? prev : layout.cellSize));
    }
  }, [layout.cellSize, minCell]);

  return layout;
}
