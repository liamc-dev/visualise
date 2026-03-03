// src/components/control/ScatterInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import { TextArea } from "../ui/TextArea";
import { useScatterInputStore } from "../../stores/useScatterInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";

export default function ScatterInputBar() {
  const rawInput = useScatterInputStore((s) => s.rawInput);
  const error = useScatterInputStore((s) => s.error);
  const points = useScatterInputStore((s) => s.points);
  const setRawInput = useScatterInputStore((s) => s.setRawInput);
  const commitInput = useScatterInputStore((s) => s.commitInput);
  const randomize = useScatterInputStore((s) => s.randomize);
  const generateRandom = useScatterInputStore((s) => s.generateRandom);
  const reset = useScatterInputStore((s) => s.reset);

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
        commitInput();
        textareaRef.current?.blur();
      }
    },
    [commitInput],
  );

  const size = points.length / 2;
  const toggleScatterInput = useLayoutStore((s) => s.toggleScatterInput);

  return (
    <div className="flex items-center gap-1.5 px-1 overflow-x-auto min-w-0">
      <TextArea
        id="scatter-input"
        ref={textareaRef}
        size="sm"
        rows={1}
        value={rawInput}
        onChange={(e) => { setRawInput(e.target.value); }}
        onBlur={commitInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        error={!!error}
        className="flex-1 min-w-0 font-mono overflow-y-auto"
        placeholder="e.g. (1, 2.1) (2, 3.9) (3, 6.2)"
      />

      {error && (
        <span className="text-xs text-tn-danger/90 font-mono whitespace-nowrap">{error}</span>
      )}

      <IconBtn onClick={randomize} title="Random" className="w-7 h-7">
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={reset} title="Reset" className="w-7 h-7">
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>

      <input
        type="range"
        min={3}
        max={20}
        value={size}
        onChange={(e) => generateRandom(Number(e.target.value))}
        className="tn-range-modern min-w-14 w-16 shrink cursor-pointer"
        style={{ ["--p" as string]: `${((size - 3) / 17) * 100}%` }}
      />
      <span className="text-xs font-mono text-tn-muted w-5 text-right">{size}</span>

      <IconBtn onClick={toggleScatterInput} title="Collapse input" className="w-7 h-7">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
