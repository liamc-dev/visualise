import { useMemo } from "react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
};

export function SpeedKnob({ value, min = 100, max = 1000, onChange }: Props) {
  // value → -135..+135 degrees (for the pointer)
  const angle = useMemo(() => {
    const t = (value - min) / (max - min); // 0..1
    return -135 + t * 270;
  }, [value, min, max]);

  // normalized 0..1 for speed & ticks
  const norm = useMemo(
    () => (value - min) / (max - min),
    [value, min, max]
  );

  // human-friendly display factor (0.5x..2.0x)
  const factor = useMemo(() => {
    return (0.5 + norm * 1.5).toFixed(1);
  }, [norm]);

  const tickCount = 11;
  const activeTicks = Math.round(norm * (tickCount - 1));

  const ticks = Array.from({ length: tickCount });

  return (
    <div className="tn-knob-wrap">
      <span className="tn-knob-label">SPEED</span>

      <div className="relative">
        <div className="tn-knob">
          {/* ticks */}
          {ticks.map((_, i) => {
            const t = i / (tickCount - 1);
            const deg = -135 + t * 270;

            return (
              <div
                key={i}
                className={`tn-knob-tick ${
                  i <= activeTicks ? "tn-knob-tick-active" : ""
                }`}
                style={{ transform: `rotate(${deg}deg)` }}
              />
            );
          })}

          <div className="tn-knob-inner">
            <div
              className="tn-knob-indicator tn-crt-pulse-led"
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
            />
          </div>

          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="tn-knob-range"
            aria-label="Playback speed"
          />
        </div>
      </div>

      <span className="tn-knob-value">{factor}×</span>
    </div>
  );
}
