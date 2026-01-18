// src/components/visualizers/MergeSortOverlay.tsx
import { MergeSortVisualState } from "../../utils/types";
import { getShiftedColumnForNode } from "../../utils/nodeUtils";
import {
  getOpacity,
  getScale,
  getBackgroundColor,
  getBoxShadow,
} from "../../utils/styleUtil";
import { useSettingsStore } from "../../stores/useSettingsStore";

type Props = {
  state: MergeSortVisualState;
  highlight: number[];
  prevHighlight: number[];
  isWriteStep: boolean;
  prevIsWriteStep: boolean;
  colOffset: number;
  cellSize: number;
};

export function MergeSortOverlay({
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

  // latest node index per depth (avoid O(n²) .some in render)
  const latestIndexByDepth = new Map<number, number>();
  for (let i = nodes.length - 1; i >= 0; i--) {
    const depth = nodes[i].depth;
    if (!latestIndexByDepth.has(depth)) {
      latestIndexByDepth.set(depth, i);
    }
  }

  return (
    <>
      {nodes.map((node, nodeIndex) => {
        // only render the last node for each depth
        if (latestIndexByDepth.get(node.depth) !== nodeIndex) return null;

        const isLatest = nodeIndex === nodes.length - 1;
        const segmentLength = node.hi - node.lo + 1;

        return Array.from({ length: segmentLength }).map((_, offset) => {
          const globalIndex = node.lo + offset;
          const value = array[globalIndex];

          const inCurrentRange =
            globalIndex >= node.lo && globalIndex <= node.hi;

          const isMid = globalIndex === node.mid;
          const isHighlight = highlight.includes(globalIndex);
          const isTrail =
            isWriteStep &&
            prevIsWriteStep &&
            !isHighlight &&
            prevHighlight.includes(globalIndex);
          const isActiveRange = isLatest && inCurrentRange;

          const shiftedColumn = getShiftedColumnForNode(
            globalIndex,
            node,
            colOffset
          );

          const x = shiftedColumn * cellSize;
          const y = (2 + node.depth * 2) * cellSize;

          const opacity = getOpacity(isLatest, isActiveRange);
          const scale = getScale(
            isLatest,
            isHighlight,
            isTrail,
            isMid,
            isActiveRange,
            node.depth
          );

          const shellColor = getBackgroundColor(
            isLatest,
            isHighlight,
            isTrail,
            isMid,
            isActiveRange,
            isWriteStep,
            node.depth
          );

          // depth-aware glow; gated by global glow toggle
          const rawShadow = isGlow
            ? getBoxShadow(
                isHighlight,
                isTrail,
                isMid,
                isActiveRange,
                isWriteStep,
                node.depth
              )
            : "none";

          const insetShadow = "var(--tn-overlay-inset)";
          const textShadow = "var(--tn-overlay-textshadow)";
          const boxShadow =
            rawShadow === "none" ? insetShadow : `${insetShadow}, ${rawShadow}`;

          const zIndex = isHighlight
            ? 30
            : isMid
            ? 20
            : isActiveRange
            ? 10
            : 1;

          const borderWidth = isHighlight ? 3 : 1;

          return (
          <div
            key={`${node.id}-${globalIndex}`}
            className="
              absolute
              w-[var(--cell)]
              h-[var(--cell)]
              text-[var(--cellText)]
              rounded-[var(--cellRadius)]
              flex items-center justify-center
              font-semibold
              text-tn-text
              bg-tn-surface
              leading-none
              border-solid
            "
            style={{
              // ✅ dynamic sizing (driven by cellSize)
              "--cell": `${cellSize}px`,
              "--cellText": `${Math.max(10, cellSize * 0.45)}px`,
              "--cellRadius": `${Math.max(4, cellSize * 0.18)}px`,

              zIndex,
              borderColor: shellColor,
              borderWidth,
              textShadow,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              opacity,
              boxShadow,
              willChange: "transform, opacity, box-shadow",
              transition: `
                transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
                border-color 200ms ease-out,
                background-color 200ms ease-out
              `,
            } as React.CSSProperties}
          >
    {value}
  </div>
);
        });
      })}
    </>
  );
}
