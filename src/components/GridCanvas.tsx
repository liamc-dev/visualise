import { GridPalette } from "../theme/colors";
import { useGridSweepPhase } from "../hooks/useGridSweepPhase";
import { lerpColor } from "../utils/styleUtil";
import { useSettingsStore } from "../stores/useSettingsStore";

export default function Grid({
  height,
  width,
  cellSize,
  sweepSpeed = 18000,
}: {
  height: number;
  width: number;
  cellSize: number;
  sweepSpeed: number;
}) {
  const glowEnabled = useSettingsStore((state) => state.glowEnabled);
  const sweepPhase = useGridSweepPhase(sweepSpeed); // internal sweep stays running

  const BASE = GridPalette.base;
  const BRIGHT = GridPalette.bright;

  const cells = [];
  const centerRow = (height - 1) / 2;
  const centerCol = (width - 1) / 2;
  const maxDist = Math.sqrt(centerRow ** 2 + centerCol ** 2);

  const intensity = 1.8;
  const falloffExponent = 0.5;

  const bandCenter = 1 - sweepPhase;
  const bandWidth = 0.22;

  const bandBoost = glowEnabled ? 0.075 : 0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const dRow = row - centerRow;
      const dCol = col - centerCol;
      const dist = Math.sqrt(dRow * dRow + dCol * dCol);
      const normalizedDist = maxDist === 0 ? 0 : dist / maxDist;

      const baseT = Math.pow(1 - normalizedDist, falloffExponent) * intensity;

      const colNorm = col / (width - 1);
      let dx = Math.abs(colNorm - bandCenter);
      dx = Math.min(dx, 1 - dx);

      const bandFactor = Math.max(0, 1 - dx / bandWidth);
      const sweepEnergy = bandFactor * bandBoost;

      const t = baseT * (1 + sweepEnergy);
      const borderColor = lerpColor(BASE, BRIGHT, t);

      const glowStrength = sweepEnergy;
      const boxShadow =
        glowEnabled && glowStrength > 0.01
          ? `0 0 ${4 + glowStrength * 8}px rgba(122, 162, 247, ${
              0.08 + glowStrength * 0.3
            })`
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
      }}
    >
      {cells}
    </div>
  );
}
