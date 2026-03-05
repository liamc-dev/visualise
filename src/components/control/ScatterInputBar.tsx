// src/components/control/ScatterInputBar.tsx

import { useCallback, useRef, useLayoutEffect } from "react";
import { Dices, RotateCcw, ChevronUp } from "lucide-react";
import { IconBtn } from "../ui/IconBtn";
import { LabeledSlider } from "../ui/LabeledSlider";
import { TextArea } from "../ui/TextArea";
import { useScatterInputStore } from "../../stores/useScatterInputStore";
import { useLayoutStore } from "../../stores/useLayoutStore";

type LRConfig = { min: number; max: number; step: number; precision: number };

const LR_CONFIGS: Record<string, LRConfig> = {
  "linear-regression": { min: 0.01, max: 0.5, step: 0.01, precision: 2 },
  "logistic-regression": { min: 0.1, max: 10, step: 0.1, precision: 1 },
};

export default function ScatterInputBar({ algorithm }: { algorithm: string }) {
  const rawInput = useScatterInputStore((s) => s.rawInput);
  const error = useScatterInputStore((s) => s.error);
  const points = useScatterInputStore((s) => s.points);
  const epochs = useScatterInputStore((s) => s.epochs);
  const learningRate = useScatterInputStore((s) => s.learningRate);
  const k = useScatterInputStore((s) => s.k);
  const setRawInput = useScatterInputStore((s) => s.setRawInput);
  const setEpochs = useScatterInputStore((s) => s.setEpochs);
  const setLearningRate = useScatterInputStore((s) => s.setLearningRate);
  const setK = useScatterInputStore((s) => s.setK);
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
  const lrConfig = LR_CONFIGS[algorithm];
  const showLR = !!lrConfig;
  const showK = algorithm === "k-means";

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

      <LabeledSlider
        label="n"
        displayValue={String(size)}
        min={3}
        max={20}
        value={size}
        onChange={(e) => generateRandom(Number(e.currentTarget.value))}
      />

      {showK && (
        <LabeledSlider
          label="k"
          displayValue={String(k)}
          min={2}
          max={6}
          value={k}
          onChange={(e) => setK(Number(e.currentTarget.value))}
        />
      )}

      {showLR && (
        <LabeledSlider
          label="lr"
          displayValue={learningRate.toFixed(lrConfig.precision)}
          min={lrConfig.min}
          max={lrConfig.max}
          step={lrConfig.step}
          value={learningRate}
          onChange={(e) => setLearningRate(Number(e.currentTarget.value))}
        />
      )}

      <LabeledSlider
        label={showK ? "iter" : "epochs"}
        displayValue={String(epochs)}
        min={1}
        max={99}
        value={epochs}
        onChange={(e) => setEpochs(Number(e.currentTarget.value))}
      />

      <IconBtn onClick={toggleScatterInput} title="Collapse input" className="w-7 h-7">
        <ChevronUp className="w-3.5 h-3.5 text-tn-muted" />
      </IconBtn>
    </div>
  );
}
