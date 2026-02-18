// src/components/control/SpeedSlider.tsx

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
  const range = max - min;
  const p = range <= 0 ? 0 : ((clamped - min) / range) * 100;

  return (
    <div className="w-42 p-0.5">
      <div className="flex items-baseline justify-between">
        <span className="text-label font-semibold tracking-wider text-tn-subtle">
          Speed
        </span>

        <span className="font-mono text-label text-tn-text">
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
        className="tn-range-modern cursor-pointer"
        style={{
          ["--p" as any]: `${p}%`,
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
