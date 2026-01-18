// src/components/control/SpeedSlider.tsx
import * as React from "react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
};

function msToMultiplier(ms: number, min: number, max: number) {
  const t = (ms - min) / (max - min); // 0..1
  const x = 0.5 + t * 1.5;            // 0.5x .. 2.0x
  return x;
}

export function SpeedSlider({
  value,
  min = 100,
  max = 1050,
  step = 10,
  onChange,
}: Props) {
  const clamped = Math.min(max, Math.max(min, value));
  const mult = msToMultiplier(clamped, min, max);

  return (
    <div className="w-42">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-tn-subtle uppercase">
          Speed
        </span>

        <span className="font-mono text-[11px] text-tn-text">
          {mult.toFixed(1)}×
        </span>
      </div>

     <input
  type="range"
  min={min}
  max={max}
  step={step}
  value={clamped}
  onChange={(e) => onChange(Number(e.target.value))}
  className="
  w-full
  h-1.5
  rounded-full
  bg-tn-border/40
  accent-tn-accent
  hover:bg-tn-border/60
  transition-colors
"
/>
      <div className="mt-1 flex justify-between text-[10px] text-tn-subtle">
        <span>Slow</span>
        <span>Fast</span>
      </div>
    </div>
  );
}
