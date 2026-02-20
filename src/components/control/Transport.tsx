// src/components/player/Transport.tsx
import { memo, useCallback } from "react";
import { SkipBack, SkipForward, Play, Pause, Square, Eye, Brain } from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
import { usePredictStore } from "../../stores/usePredictStore";
import { useHoldRepeat } from "../../hooks/use-hold-repeat";

type TransportButtonProps = {
  disabled?: boolean;
  title: string;
  ariaLabel: string;
  onClick?: () => void;
  buttonProps?: Record<string, any>;
  className: string;
  children: React.ReactNode;
};

function TransportButton({
  disabled,
  title,
  ariaLabel,
  onClick,
  buttonProps,
  className,
  children,
}: TransportButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      {...buttonProps}
      className={className}
    >
      {children}
    </button>
  );
}

function Transport() {

  const currentStep = usePlayerStore((s) => s.currentStep);
  const stepsLength = usePlayerStore((s) => s.stepsLength);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const _paused = usePlayerStore((s) => s.paused);

  const nextStep = usePlayerStore((s) => s.nextStep);
  const prevStep = usePlayerStore((s) => s.prevStep);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setPaused = usePlayerStore((s) => s.setPaused);
  const reset = usePlayerStore((s) => s.reset);
  const awaitingReveal = usePlayerStore((s) => s.awaitingReveal);
  const setAwaitingReveal = usePlayerStore((s) => s.setAwaitingReveal);

  const predictEnabled = usePredictStore((s) => s.predictEnabled);
  const togglePredict = usePredictStore((s) => s.togglePredict);

  const isFirst = currentStep <= 0;
  const isLast = stepsLength > 0 && currentStep >= stepsLength - 1;

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      setPlaying(false);
      setPaused(true);
    } else {
      setPaused(false);
      setPlaying(true);
    }
  }, [isPlaying, setPaused, setPlaying]);

  const holdNext = useHoldRepeat(
    () => {
      if (!isLast) {
        nextStep();
        if (predictEnabled) setAwaitingReveal(true);
      }
    },
    { enabled: !isLast && !awaitingReveal, delay: 400, interval: 90 }
  );

  const holdPrev = useHoldRepeat(
    () => {
      if (!isFirst) {
        prevStep();
        if (predictEnabled) setAwaitingReveal(true);
      }
    },
    { enabled: !isFirst, delay: 400, interval: 90 }
  );

  const groupClass = `
    flex items-stretch gap-1
    w-full h-[40px]
  `;

  const btnBase = `
    flex-1 h-full aspect-square
    rounded-lg grid place-items-center
    text-tn-text hover:bg-tn-surface
    disabled:opacity-40 disabled:hover:bg-transparent
    focus:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/35
  `;

  const playVisual = isPlaying
    ? "border-tn-accent/25 bg-tn-accent/10 text-tn-accent hover:bg-tn-accent/15"
    : "border-tn-accent/35 bg-tn-accent/15 text-tn-accent hover:bg-tn-accent/20";

  const playTitle = isPlaying ? "Pause" : "Play";

  return (
    <div className={groupClass}>
      <TransportButton
        key="prev"
        disabled={isFirst}
        title="Previous"
        ariaLabel="Previous"
        buttonProps={holdPrev}
        className={btnBase}
      >
        <SkipBack size={14} />
      </TransportButton>

      <TransportButton
        key="play"
        title={playTitle}
        ariaLabel={playTitle}
        onClick={togglePlayPause}
        className={`${btnBase} border transition ${playVisual}`}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={14} />}
      </TransportButton>

      <TransportButton
        key="stop"
        title="Stop"
        ariaLabel="Stop"
        onClick={reset}
        className={btnBase}
      >
        <Square size={14} />
      </TransportButton>

      {awaitingReveal ? (
        <TransportButton
          key="reveal"
          title="Reveal"
          ariaLabel="Reveal"
          onClick={() => setAwaitingReveal(false)}
          className={`${btnBase} text-tn-accent`}
        >
          <Eye size={14} />
        </TransportButton>
      ) : (
        <TransportButton
          key="next"
          disabled={isLast}
          title="Next"
          ariaLabel="Next"
          buttonProps={holdNext}
          className={btnBase}
        >
          <SkipForward size={14} />
        </TransportButton>
      )}

      <TransportButton
        key="predict"
        title={predictEnabled ? "Disable predict mode" : "Enable predict mode"}
        ariaLabel={predictEnabled ? "Disable predict mode" : "Enable predict mode"}
        onClick={togglePredict}
        className={[
          btnBase,
          "border transition",
          predictEnabled
            ? "border-tn-accent/25 bg-tn-accent/10 text-tn-accent hover:bg-tn-accent/15"
            : "border-transparent text-tn-muted hover:text-tn-text",
        ].join(" ")}
      >
        <Brain size={14} />
      </TransportButton>
    </div>
  );
}

export default memo(Transport);
