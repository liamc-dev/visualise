// src/components/control/GraphInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { Btn } from "../ui/Btn";
import { IconBtn } from "../ui/IconBtn";
import { TextArea } from "../ui/TextArea";
import { useGraphInputStore } from "../../stores/useGraphInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";
import { NODES, decodeGraphInput } from "../../lib/graph-utils";

type Props = {
  weighted: boolean;
  defaults: number[];
};

export default function GraphInputBar({ weighted, defaults }: Props) {
  const rawInput = useGraphInputStore((s) => s.rawInput);
  const error = useGraphInputStore((s) => s.error);
  const array = useGraphInputStore((s) => s.array);
  const setRawInput = useGraphInputStore((s) => s.setRawInput);
  const commitInput = useGraphInputStore((s) => s.commitInput);
  const setSource = useGraphInputStore((s) => s.setSource);
  const randomize = useGraphInputStore((s) => s.randomize);
  const reset = useGraphInputStore((s) => s.reset);
  const toggleGraphInput = useLayoutStore((s) => s.toggleGraphInput);

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
        commitInput(weighted);
        textareaRef.current?.blur();
      }
    },
    [commitInput, weighted],
  );

  // Sync rawInput display format when weighted prop changes
  useLayoutEffect(() => {
    const { edges } = decodeGraphInput(array);
    const parts = edges
      .map((e) => {
        const label = `${e.from}-${e.to}`;
        return weighted ? `${label}:${e.weight}` : label;
      })
      .join(", ");
    // Only update if the format actually differs (avoid infinite loops)
    if (parts !== rawInput) {
      useGraphInputStore.setState({ rawInput: parts, error: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighted]);

  return (
    <div className="flex items-center gap-1.5 px-1">
      {/* Source selector */}
      <div className="flex gap-0.5">
        {NODES.map((label, idx) => (
          <Btn
            key={label}
            variant="ghost"
            size="icon"
            pressed={idx === sourceIdx}
            onClick={() => setSource(idx, weighted)}
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
        onChange={(e) => setRawInput(e.target.value, weighted)}
        onBlur={() => commitInput(weighted)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 min-w-0 font-mono overflow-y-auto"
        placeholder={weighted ? "e.g. A-B:3, A-C:1" : "e.g. A-B, A-C, B-D"}
      />

      {error && (
        <span className="text-xs text-tn-danger/90 font-mono whitespace-nowrap">
          {error}
        </span>
      )}

      {/* Action icons */}
      <IconBtn
        onClick={() => randomize(weighted)}
        title="Random graph"
        className="w-7 h-7"
      >
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn
        onClick={() => reset(defaults, weighted)}
        title="Reset"
        className="w-7 h-7"
      >
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>

      {/* Collapse */}
      <IconBtn
        onClick={toggleGraphInput}
        title="Collapse input"
        className="w-7 h-7"
      >
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
