import { memo } from "react";
import type { ReactNode } from "react";
import { useGridSweepPhase } from "../../hooks/use-grid-sweep-phase";
import { lerpColor } from "../../utils/styleUtil";
import { useSettingsStore } from "../../stores/useSettingsStore";

type TokyoNightGridProps = {
  height: number;
  width: number;
  cellSize: number;
  sweepSpeed: number;
};

export default memo(function TokyoNightGrid({
  height,
  width,
  cellSize,
  sweepSpeed = 18000,
}: TokyoNightGridProps) {
  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const sweepPhase = useGridSweepPhase(sweepSpeed, 100, 1000, effectsEnabled);

  const BASE = "#1f2335";
  const BRIGHT = "#8f962fff";

  const centerRow = (height - 1) / 2;
  const centerCol = (width - 1) / 2;
  const maxDist = Math.sqrt(centerRow ** 2 + centerCol ** 2) || 1;

  const intensity = 1.8;
  const falloffExponent = 0.5;

  const bandCenter = 1 - sweepPhase;
  const bandWidth = 0.22;
  const bandBoost = effectsEnabled ? 0.475 : 0;

  const cells: ReactNode[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // radial falloff
      const dRow = row - centerRow;
      const dCol = col - centerCol;
      const normalizedDist = Math.sqrt(dRow * dRow + dCol * dCol) / maxDist;
      const baseT = Math.pow(1 - normalizedDist, falloffExponent) * intensity;

      // sweep band (wrap-around distance)
      const colNorm = width > 1 ? col / (width - 1) : 0;
      const raw = Math.abs(colNorm - bandCenter);
      const dx = Math.min(raw, 1 - raw);
      const bandFactor = Math.max(0, 1 - dx / bandWidth);
      const sweepEnergy = bandFactor * bandBoost;

      const t = baseT * (1 + sweepEnergy);
      const borderColor = lerpColor(BASE, BRIGHT, t);

      const boxShadow =
        effectsEnabled && sweepEnergy > 0.01
          ? `0 0 ${4 + sweepEnergy * 8}px rgba(122,162,247,${0.08 + sweepEnergy * 0.3})`
          : "none";

      cells.push(
        <div
          key={`${row}-${col}`}
          className="border"
          style={{ borderColor, boxShadow }}
        />
      );
    }
  }

  return (
    <div
      className="grid absolute max-w-none"
      style={{
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
        opacity: 0.4
      }}
    >
      {cells}
    </div>
  );
});
