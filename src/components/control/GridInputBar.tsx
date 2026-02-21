// src/components/control/GridInputBar.tsx

import { useMemo } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import PortalSelect from "../ui/portal-select/PortalSelect";
import type { PortalSelectOption } from "../ui/portal-select/PortalSelectBase";
import { useGridInputStore } from "../../stores/useGridInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from "../../lib/grid-utils";

const SIZE_OPTIONS: PortalSelectOption<string>[] = Array.from(
  { length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 },
  (_, i) => {
    const v = MIN_GRID_SIZE + i;
    return { value: String(v), label: String(v) };
  },
);

function rangeOptions(count: number): PortalSelectOption<string>[] {
  return Array.from({ length: count }, (_, i) => ({
    value: String(i),
    label: String(i),
  }));
}

export default function GridInputBar() {
  const array = useGridInputStore((s) => s.array);
  const rows = useGridInputStore((s) => s.rows);
  const cols = useGridInputStore((s) => s.cols);
  const wallDensity = useGridInputStore((s) => s.wallDensity);
  const setRows = useGridInputStore((s) => s.setRows);
  const setCols = useGridInputStore((s) => s.setCols);
  const setStart = useGridInputStore((s) => s.setStart);
  const setWallDensity = useGridInputStore((s) => s.setWallDensity);
  const randomize = useGridInputStore((s) => s.randomize);
  const reset = useGridInputStore((s) => s.reset);
  const toggleGridInput = useLayoutStore((s) => s.toggleGridInput);

  const startRow = array[2] ?? 0;
  const startCol = array[3] ?? 0;

  const rowOptions = useMemo(() => rangeOptions(rows), [rows]);
  const colOptions = useMemo(() => rangeOptions(cols), [cols]);

  const densityPct = Math.round(wallDensity * 100);

  return (
    <div className="flex items-center gap-1.5 px-1">
      {/* Grid size selects */}
      <span className="text-xs text-tn-muted whitespace-nowrap">Rows</span>
      <PortalSelect
        value={String(rows)}
        options={SIZE_OPTIONS}
        onChange={(v) => setRows(Number(v))}
      />

      <span className="text-xs text-tn-muted whitespace-nowrap">Cols</span>
      <PortalSelect
        value={String(cols)}
        options={SIZE_OPTIONS}
        onChange={(v) => setCols(Number(v))}
      />

      {/* Separator */}
      <div className="w-px h-4 bg-tn-border/40 mx-0.5" />

      {/* Start position selects */}
      <span className="text-xs text-tn-muted whitespace-nowrap">Row</span>
      <PortalSelect
        value={String(startRow)}
        options={rowOptions}
        onChange={(v) => setStart(Number(v), startCol)}
      />

      <span className="text-xs text-tn-muted whitespace-nowrap">Col</span>
      <PortalSelect
        value={String(startCol)}
        options={colOptions}
        onChange={(v) => setStart(startRow, Number(v))}
      />

      {/* Wall density slider */}
      <input
        type="range"
        min={0}
        max={40}
        value={densityPct}
        onChange={(e) => setWallDensity(Number(e.target.value) / 100)}
        className="tn-range-modern w-20 cursor-pointer"
        style={{ ["--p" as string]: `${(densityPct / 40) * 100}%` }}
        title={`Wall density: ${densityPct}%`}
      />
      <span className="text-xs font-mono text-tn-muted w-7 text-right">
        {densityPct}%
      </span>

      {/* Action icons */}
      <IconBtn onClick={randomize} title="Random grid" className="w-7 h-7">
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={reset} title="Reset grid" className="w-7 h-7">
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>

      {/* Collapse — right-aligned */}
      <IconBtn onClick={toggleGridInput} title="Collapse input" className="w-7 h-7 ml-auto">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
