// src/components/grid/GridCanvas.tsx
import { memo, useMemo } from "react";
import type { ReactNode } from "react";
import { useThemeStore } from "../../stores/useThemeStore";
import TokyoNightGrid from "./TokyoNightGrid";

type GridProps = {
  height: number;
  width: number;
  cellSize: number;
  sweepSpeed: number;
};

export default memo(function Grid({
  height,
  width,
  cellSize,
  sweepSpeed = 18000,
}: GridProps) {
  const theme = useThemeStore((s) => s.theme);
  const isTokyo = theme === "tokyo-night";

  const cells = useMemo(() => {
    const out: ReactNode[] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        out.push(<div key={`${r}-${c}`} className="tn-grid-cell" />);
      }
    }
    return out;
  }, [height, width]);

  if (isTokyo) {
    return (
      <TokyoNightGrid
        height={height}
        width={width}
        cellSize={cellSize}
        sweepSpeed={sweepSpeed}
      />
    );
  }

  return (
    <div
      className="grid absolute max-w-none"
      style={{
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
      }}
    >
      {cells}
    </div>
  );
});
