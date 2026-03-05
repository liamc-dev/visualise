// src/components/control/BinarySearchInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import { LabeledSlider } from "../ui/LabeledSlider";
import { useBinarySearchInputStore } from "../../stores/useBinarySearchInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";

export default function BinarySearchInputBar() {
  const rawInput = useBinarySearchInputStore((s) => s.rawInput);
  const rawTarget = useBinarySearchInputStore((s) => s.rawTarget);
  const error = useBinarySearchInputStore((s) => s.error);
  const targetError = useBinarySearchInputStore((s) => s.targetError);
  const array = useBinarySearchInputStore((s) => s.array);
  const setRawInput = useBinarySearchInputStore((s) => s.setRawInput);
  const setRawTarget = useBinarySearchInputStore((s) => s.setRawTarget);
  const commitInput = useBinarySearchInputStore((s) => s.commitInput);
  const commitTarget = useBinarySearchInputStore((s) => s.commitTarget);
  const randomize = useBinarySearchInputStore((s) => s.randomize);
  const generateRandom = useBinarySearchInputStore((s) => s.generateRandom);
  const reset = useBinarySearchInputStore((s) => s.reset);

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
  const toggleBinarySearchInput = useLayoutStore((s) => s.toggleBinarySearchInput);

  const displayError = error || targetError;

  return (
    <div className="flex items-center gap-1.5 px-1 overflow-x-auto min-w-0">
      {/* Sorted array input */}
      <textarea
        id="binary-search-array-input"
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
        placeholder="sorted: 2, 5, 8, 11, 14"
      />

      {/* Target input */}
      <span className="text-xs text-tn-muted whitespace-nowrap">Target</span>
      <input
        id="binary-search-target-input"
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
        placeholder="17"
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

      <LabeledSlider
        label="n"
        displayValue={String(size)}
        min={3}
        max={24}
        value={size}
        onChange={(e) => generateRandom(Number(e.currentTarget.value))}
      />

      {/* Collapse */}
      <IconBtn onClick={toggleBinarySearchInput} title="Collapse input" className="w-7 h-7">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
