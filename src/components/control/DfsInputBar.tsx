// src/components/control/DfsInputBar.tsx

import { useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { Btn } from "../ui/Btn";
import { IconBtn } from "../ui/IconBtn";
import { TextArea } from "../ui/TextArea";
import PortalSelect from "../ui/portal-select/PortalSelect";
import type { PortalSelectOption } from "../ui/portal-select/PortalSelectBase";
import { useGraphInputStore } from "../../stores/useGraphInputStore";
import { useGridInputStore } from "../../stores/useGridInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";
import { NODES, decodeGraphInput, DEFAULT_DIJKSTRA_INPUT } from "../../lib/graph-utils";
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

export default function DfsInputBar() {
  const dfsMode = useLayoutStore((s) => s.dfsMode);
  const setDfsMode = useLayoutStore((s) => s.setDfsMode);
  const toggleDfsInput = useLayoutStore((s) => s.toggleDfsInput);

  return (
    <div className="flex items-center gap-1.5 px-1 overflow-x-auto min-w-0">
      {/* Mode toggle */}
      <div className="flex gap-0.5">
        <Btn
          variant="ghost"
          size="sm"
          pressed={dfsMode === "graph"}
          onClick={() => setDfsMode("graph")}
          className="text-xs"
        >
          Graph
        </Btn>
        <Btn
          variant="ghost"
          size="sm"
          pressed={dfsMode === "grid"}
          onClick={() => setDfsMode("grid")}
          className="text-xs"
        >
          Grid
        </Btn>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-tn-border/40 mx-0.5" />

      {dfsMode === "graph" ? <GraphControls /> : <GridControls />}

      {/* Collapse — right-aligned */}
      <IconBtn onClick={toggleDfsInput} title="Collapse input" className="w-7 h-7 ml-auto">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}

/* ---- Graph mode controls ---- */

function GraphControls() {
  const rawInput = useGraphInputStore((s) => s.rawInput);
  const error = useGraphInputStore((s) => s.error);
  const array = useGraphInputStore((s) => s.array);
  const setRawInput = useGraphInputStore((s) => s.setRawInput);
  const commitInput = useGraphInputStore((s) => s.commitInput);
  const setSource = useGraphInputStore((s) => s.setSource);
  const randomize = useGraphInputStore((s) => s.randomize);
  const reset = useGraphInputStore((s) => s.reset);

  const sourceIdx = array[0] ?? 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    const maxH = parseFloat(getComputedStyle(el).lineHeight) * 2 + 8;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, []);

  useLayoutEffect(autoResize, [rawInput, autoResize]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitInput(false);
        textareaRef.current?.blur();
      }
    },
    [commitInput],
  );

  // Sync rawInput display format on mount (unweighted)
  useLayoutEffect(() => {
    const { edges } = decodeGraphInput(array);
    const parts = edges.map((e) => `${e.from}-${e.to}`).join(", ");
    if (parts !== rawInput) {
      useGraphInputStore.setState({ rawInput: parts, error: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Source selector */}
      <div className="flex gap-0.5">
        {NODES.map((label, idx) => (
          <Btn
            key={label}
            variant="ghost"
            size="icon"
            pressed={idx === sourceIdx}
            onClick={() => setSource(idx, false)}
            className="font-mono"
          >
            {label}
          </Btn>
        ))}
      </div>

      {/* Edge textarea */}
      <TextArea
        ref={textareaRef}
        size="sm"
        error={!!error}
        rows={1}
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value, false)}
        onBlur={() => commitInput(false)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 min-w-0 font-mono overflow-y-auto"
        placeholder="e.g. A-B, A-C, B-D"
      />

      {error && (
        <span className="text-xs text-tn-danger/90 font-mono whitespace-nowrap">
          {error}
        </span>
      )}

      {/* Action icons */}
      <IconBtn onClick={() => randomize(false)} title="Random graph" className="w-7 h-7">
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={() => reset(DEFAULT_DIJKSTRA_INPUT, false)} title="Reset" className="w-7 h-7">
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </>
  );
}

/* ---- Grid mode controls ---- */

function GridControls() {
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

  const startRow = array[2] ?? 0;
  const startCol = array[3] ?? 0;

  const rowOptions = useMemo(() => rangeOptions(rows), [rows]);
  const colOptions = useMemo(() => rangeOptions(cols), [cols]);

  const densityPct = Math.round(wallDensity * 100);

  return (
    <>
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
        className="tn-range-modern min-w-16 w-20 shrink cursor-pointer"
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
    </>
  );
}
