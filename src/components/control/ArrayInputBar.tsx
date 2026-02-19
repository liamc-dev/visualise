// src/components/control/ArrayInputBar.tsx

import { useCallback, useRef } from "react";
import { Shuffle, Dices, RotateCcw } from "lucide-react";
import { Panel } from "../ui/Panel";
import { Btn } from "../ui/Btn";
import { TextInput } from "../ui/TextInput";
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

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitInput();
        inputRef.current?.blur();
      }
    },
    [commitInput]
  );

  const size = array.length;

  return (
    <Panel tone="soft" radius="xl" className="px-3 py-2.5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label tracking-[0.18em] uppercase text-tn-subtle/70 font-semibold">
          Input Array
        </span>
        <span className="text-xs font-mono text-tn-muted">
          {array.length} elements
        </span>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Text input */}
        <TextInput
          ref={inputRef}
          size="sm"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          onBlur={commitInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          error={!!error}
          className="flex-1 min-w-0 font-mono"
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
            <span className="hidden sm:inline">Shuffle</span>
          </Btn>

          <Btn
            variant="ghost"
            size="sm"
            onClick={() => generateRandom(size)}
            title="Random"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Random</span>
          </Btn>

          <Btn
            variant="ghost"
            size="sm"
            onClick={reset}
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Btn>
        </div>

        {/* Size slider */}
        <div className="hidden sm:flex items-center gap-2">
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

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500/90 font-mono">{error}</p>
      )}
    </Panel>
  );
}
