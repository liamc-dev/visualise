// src/components/control/ArrayInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Shuffle, Dices, RotateCcw } from "lucide-react";
import { Panel } from "../ui/Panel";
import { Btn } from "../ui/Btn";
import { useArrayInputStore } from "../../stores/useArrayInputStore";

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
    el.style.height = `${el.scrollHeight}px`;
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

  return (
    <Panel tone="glass" radius="xl" className="@container px-3 py-2.5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 font-semibold">
          Input Array
        </span>

        <div className="flex items-center gap-2">
          <span className="text-label text-tn-subtle/70 whitespace-nowrap">Size</span>
          <input
            type="range"
            min={3}
            max={24}
            value={size}
            onChange={(e) => generateRandom(Number(e.target.value))}
            className="tn-range-modern w-20 cursor-pointer"
            style={{ ["--p" as string]: `${((size - 3) / 21) * 100}%` }}
          />
          <span className="text-xs font-mono text-tn-muted w-5 text-right">
            {size}
          </span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
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
            "flex-1 min-w-0 font-mono resize-none",
            "min-h-7 px-2 py-1 rounded-lg text-xs leading-snug",
            "w-full border text-tn-text bg-tn-surfaceSoft/55",
            "focus:outline-none focus:ring-2",
            "placeholder:text-tn-muted/60 transition",
            error
              ? "border-tn-danger/70 focus:ring-tn-danger/30"
              : "border-tn-border focus:ring-tn-accent/30",
          ].join(" ")}
          placeholder="e.g. 5, 3, 8, 1, 12"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Btn
            variant="ghost"
            size="sm"
            onClick={shuffle}
            title="Shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden @lg:inline">Shuffle</span>
          </Btn>

          <Btn
            variant="ghost"
            size="sm"
            onClick={() => generateRandom(size)}
            title="Random"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden @lg:inline">Random</span>
          </Btn>

          <Btn
            variant="ghost"
            size="sm"
            onClick={reset}
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden @lg:inline">Reset</span>
          </Btn>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-tn-danger/90 font-mono">{error}</p>
      )}
    </Panel>
  );
}
