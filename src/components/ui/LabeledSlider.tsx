import { type InputHTMLAttributes } from "react";

type Props = {
  label: string;
  displayValue: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function LabeledSlider({ label, displayValue, className, min, max, value, style, ...rest }: Props) {
  const lo = Number(min ?? 0);
  const hi = Number(max ?? 100);
  const v = Number(value ?? lo);
  const pct = hi === lo ? 0 : ((v - lo) / (hi - lo)) * 100;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between text-micro font-mono text-tn-muted">
        <span>{label}</span>
        <span>{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={`tn-range-modern min-w-14 w-16 shrink cursor-pointer ${className ?? ""}`}
        style={{ ["--p" as string]: `${pct}%`, ...style }}
        {...rest}
      />
    </div>
  );
}
