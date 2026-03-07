// src/components/control/ControlsOverlay.tsx
import Transport from "./Transport";
import { SpeedSlider } from "./SpeedSlider";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { useSettingsStore } from "../../stores/useSettingsStore";

type Props = { visible: boolean };

export default function ControlsOverlay({ visible }: Props) {
  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const currentStep = usePlayerStore((s) => s.currentStep);
  const stepsLength = usePlayerStore((s) => s.stepsLength);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const paused = usePlayerStore((s) => s.paused);
  const speedMs = usePlayerStore((s) => s.speedMs);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const awaitingReveal = usePlayerStore((s) => s.awaitingReveal);

  const totalSteps = stepsLength || 1;
  const currentIndex = currentStep + 1;
  const pad3 = (n: number) => String(n).padStart(3, "0");
  const status = awaitingReveal
    ? "Predict"
    : isPlaying
      ? "Playing"
      : paused
        ? "Paused"
        : "Stopped";

  return (
    <div
      className={[
        // Mobile: normal flow with padding
        "p-3 sm:p-4",
        // Desktop: absolute overlay at bottom of section
        "md:absolute md:bottom-0 md:left-0 md:right-0 md:z-10",
        "md:rounded-b-st-xl",
        effectsEnabled ? "md:bg-tn-surface/80 md:backdrop-blur-md" : "md:bg-tn-surface/90",
        "md:border-t md:border-tn-border/30",
        "md:px-4 md:py-2",
        // Fade transition (desktop only)
        "md:transition-[opacity,transform] md:duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "md:opacity-0 md:translate-y-1 md:pointer-events-none",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Transport + step counter — stacked on mobile, inline on desktop */}
        <div className="flex flex-col items-center md:flex-row md:items-center md:gap-3 shrink-0">
          <Transport />
          <div className="mt-1 md:mt-0 text-xs font-mono text-tn-muted text-center whitespace-nowrap">
            {pad3(currentIndex)}
            <span className="text-tn-subtle"> / </span>
            {pad3(totalSteps)}
            <span className="mx-2 text-tn-subtle">·</span>
            <span className="text-tn-subtle/80">{status}</span>
          </div>
        </div>

        {/* Speed slider */}
        <div className="w-full md:w-[180px] md:min-w-[60px] md:shrink">
          <div className="w-full">
            <SpeedSlider value={speedMs} min={100} max={1050} onChange={setSpeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
