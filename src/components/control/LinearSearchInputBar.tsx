// src/components/control/LinearSearchInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import { useLinearSearchInputStore } from "../../stores/useLinearSearchInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";

export default function LinearSearchInputBar() {
  const rawInput = useLinearSearchInputStore((s) => s.rawInput);
  const rawTarget = useLinearSearchInputStore((s) => s.rawTarget);
  const error = useLinearSearchInputStore((s) => s.error);
  const targetError = useLinearSearchInputStore((s) => s.targetError);
  const array = useLinearSearchInputStore((s) => s.array);
  const setRawInput = useLinearSearchInputStore((s) => s.setRawInput);
  const setRawTarget = useLinearSearchInputStore((s) => s.setRawTarget);
  const commitInput = useLinearSearchInputStore((s) => s.commitInput);
  const commitTarget = useLinearSearchInputStore((s) => s.commitTarget);
  const randomize = useLinearSearchInputStore((s) => s.randomize);
  const generateRandom = useLinearSearchInputStore((s) => s.generateRandom);
  const reset = useLinearSearchInputStore((s) => s.reset);

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

  const handleTargetKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitTarget();
        (e.target as HTMLInputElement).blur();
      }
    },
    [commitTarget],
  );

  const size = array.length;
  const toggleLinearSearchInput = useLayoutStore((s) => s.toggleLinearSearchInput);

  const displayError = error || targetError;

  return (
    <div className="flex items-center gap-1.5 px-1 overflow-x-auto min-w-0">
      {/* Array input */}
      <textarea
        id="linear-search-array-input"
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

      {/* Target input */}
      <span className="text-xs text-tn-muted whitespace-nowrap">Target</span>
      <input
        id="linear-search-target-input"
        type="text"
        inputMode="numeric"
        value={rawTarget}
        onChange={(e) => { setRawTarget(e.target.value); }}
        onBlur={commitTarget}
        onKeyDown={handleTargetKeyDown}
        spellCheck={false}
        className={[
          "w-10 font-mono text-center",
          "min-h-7 px-1 py-1 rounded-st-sm text-xs leading-snug",
          "border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] text-tn-text bg-tn-surfaceSoft/55",
          "focus:outline-none focus:ring-2",
          "placeholder:text-tn-muted/60 transition",
          targetError
            ? "border-tn-danger/70 focus:ring-tn-danger/30"
            : "border-tn-border focus:ring-tn-accent/30",
        ].join(" ")}
        placeholder="8"
      />

      {displayError && (
        <span className="text-xs text-tn-danger/90 font-mono whitespace-nowrap">{displayError}</span>
      )}

      {/* Action icons */}
      <IconBtn onClick={randomize} title="Random" className="w-7 h-7">
        <Dices className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
      <IconBtn onClick={reset} title="Reset" className="w-7 h-7">
        <RotateCcw className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>

      {/* Size slider */}
      <input
        type="range"
        min={3}
        max={24}
        value={size}
        onChange={(e) => generateRandom(Number(e.target.value))}
        className="tn-range-modern min-w-14 w-16 shrink cursor-pointer"
        style={{ ["--p" as string]: `${((size - 3) / 21) * 100}%` }}
      />
      <span className="text-xs font-mono text-tn-muted w-5 text-right">{size}</span>

      {/* Collapse */}
      <IconBtn onClick={toggleLinearSearchInput} title="Collapse input" className="w-7 h-7">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
