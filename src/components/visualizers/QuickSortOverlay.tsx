import { QuickSortVisualState } from "../../utils/types";
import {
  getOpacity,
  getScale,
  getBackgroundColor,
  getBoxShadow,
} from "../../utils/styleUtil";
import { useSettingsStore } from "../../stores/useSettingsStore";

type Props = {
  state: QuickSortVisualState;
  highlight: number[];
  prevHighlight: number[];
  isWriteStep: boolean; // for QS: "swap" / "pivot-place" steps
  prevIsWriteStep: boolean;
  colOffset: number;
  cellSize: number;
};

export function QuickSortOverlay({
  state,
  highlight,
  prevHighlight,
  isWriteStep,
  prevIsWriteStep,
  colOffset,
  cellSize,
}: Props) {
  const { nodes, array } = state;
  const isGlow = useSettingsStore((s) => s.glowEnabled);

  if (!nodes.length) return null;

  // latest node index per depth (avoid O(n²) .some)
  const latestIndexByDepth = new Map<number, number>();
  for (let i = nodes.length - 1; i >= 0; i--) {
    const depth = nodes[i].depth;
    if (!latestIndexByDepth.has(depth)) latestIndexByDepth.set(depth, i);
  }

  return (
    <>
      {nodes.map((node, nodeIndex) => {
        if (latestIndexByDepth.get(node.depth) !== nodeIndex) return null;

        const isLatestNode = nodeIndex === nodes.length - 1;
        const segmentLength = node.hi - node.lo + 1;

        return Array.from({ length: segmentLength }).map((_, offset) => {
          const globalIndex = node.lo + offset;
          const value = array[globalIndex];

          const inCurrentRange =
            globalIndex >= node.lo && globalIndex <= node.hi;

          const isPivot = globalIndex === node.pivotIndex;
          const isHighlight = highlight.includes(globalIndex);
          const isTrail =
            isWriteStep &&
            prevIsWriteStep &&
            !isHighlight &&
            prevHighlight.includes(globalIndex);
          const isActiveRange = isLatestNode && inCurrentRange;

          const isJ = globalIndex === node.scanIndex;
          const isI = globalIndex === node.boundaryIndex;

          const x = (colOffset + globalIndex) * cellSize;
          const y = (2 + node.depth * 2) * cellSize;

          const opacity = getOpacity(isLatestNode, isActiveRange);
          const scale = getScale(
            isLatestNode,
            isHighlight,
            isTrail,
            isPivot,
            isActiveRange,
            node.depth
          );

          const baseShellColor = getBackgroundColor(
            isLatestNode,
            isHighlight,
            isTrail,
            false,
            isActiveRange,
            isWriteStep,
            node.depth
          );

          const rawShadow = isGlow
            ? getBoxShadow(
                isHighlight,
                isTrail,
                isPivot, // pivot as "mid"
                isActiveRange,
                isWriteStep,
                node.depth
              )
            : "none";

          const insetShadow = "inset 0 0 4px rgba(0,0,0,0.6)";
          const boxShadow =
            rawShadow === "none" ? insetShadow : `${insetShadow}, ${rawShadow}`;

          let borderColor = baseShellColor;
          if (isPivot) borderColor = "var(--color-tn-warning)";
          else if (isI) borderColor = "var(--color-tn-cyan)";
          else if (isJ) borderColor = "var(--color-tn-magenta)";

          const zIndex = isHighlight
            ? 30
            : isPivot || isI || isJ
            ? 25
            : isActiveRange
            ? 10
            : 1;

          const borderWidth =
            isHighlight || isPivot || isI || isJ ? 3 : 1;

          return (
            <div
              key={`${node.id}-${globalIndex}`}
              className="
                absolute w-6 h-6
                flex items-center justify-center
                text-sm font-semibold
                text-tn-text
                rounded-md
                bg-tn-surface
              "
              style={{
                zIndex,
                borderColor,
                borderWidth,
                textShadow: "0 0 6px rgba(0,0,0,0.9)",
                backgroundColor: isPivot
                  ? "color-mix(in srgb, var(--color-tn-warning) 18%, transparent)"
                  : undefined,
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                opacity,
                boxShadow,
                transition: `
                  transform 260ms cubic-bezier(0.25, 0.8, 0.25, 1),
                  opacity 220ms ease,
                  box-shadow 200ms ease,
                  border-color 180ms ease,
                  background-color 200ms ease
                `,
              }}
            >
              {value}
            </div>
          );
        });
      })}
    </>
  );
}
