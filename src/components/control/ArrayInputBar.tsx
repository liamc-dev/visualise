// src/components/control/ArrayInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Shuffle, Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import { LabeledSlider } from "../ui/LabeledSlider";
import { useArrayInputStore } from "../../stores/useArrayInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";

export default function ArrayInputBar() {
  const rawInput = useArrayInputStore((s) => s.rawInput);
  const error = useArrayInputStore((s) => s.error);
  const array = useArrayInputStore((s) => s.array);
  const setRawInput = useArrayInputStore((s) => s.setRawInput);
  const commitInput = useArrayInputStore((s) => s.commitInput);
  const shuffle = useArrayInputStore((s) => s.shuffle);
  const generateRandom = useArrayInputStore((s) => s.generateRandom);
  const reset = useArrayInputStore((s) => s.reset);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    // Cap at 2 visible rows — scroll beyond that
    const maxH = parseFloat(getComputedStyle(el).lineHeight) * 2 + 8; // 8 = py-1 top+bottom
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
    [commitInput]
  );

  const size = array.length;
  const toggleArrayInput = useLayoutStore((s) => s.toggleArrayInput);

  return (
    <div className="flex items-center gap-1.5 px-1 overflow-x-auto min-w-0">
      {/* Text input */}
      <textarea
        id="array-input"
        ref={textareaRef}
        rows={1}
        value={rawInput}
        onChange={(e) => { setRawInput(e.target.value); }}
        onBlur={commitInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={[
          "flex-1 min-w-0 font-mono resize-none overflow-y-auto",
          "min-h-7 px-2 py-1 rounded-st-sm text-xs leading-snug",
          "border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] text-tn-text bg-tn-surfaceSoft/55",
          "focus:outline-none focus:ring-2",
          "placeholder:text-tn-muted/60 transition",
          error
            ? "border-tn-danger/70 focus:ring-tn-danger/30"
            : "border-tn-border focus:ring-tn-accent/30",
        ].join(" ")}
        placeholder="e.g. 5, 3, 8, 1, 12"
      />

      {error && (
        <span className="text-xs text-tn-danger/90 font-mono whitespace-nowrap">{error}</span>
      )}

      {/* Action icons */}
      <IconBtn onClick={shuffle} title="Shuffle" className="w-7 h-7">
        <Shuffle className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={() => generateRandom(size)} title="Random" className="w-7 h-7">
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={reset} title="Reset" className="w-7 h-7">
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>

      <LabeledSlider
        label="n"
        displayValue={String(size)}
        min={3}
        max={24}
        value={size}
        onChange={(e) => generateRandom(Number(e.currentTarget.value))}
      />

      {/* Collapse */}
      <IconBtn onClick={toggleArrayInput} title="Collapse input" className="w-7 h-7">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
