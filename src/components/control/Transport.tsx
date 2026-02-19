// src/components/player/Transport.tsx
import { memo, useCallback } from "react";
import { SkipBack, SkipForward, Play, Pause, Square } from "lucide-react";
import { usePlayerStore } from "../../stores/usePlayerStore";
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
      if (!isLast) nextStep();
    },
    { enabled: !isLast, delay: 400, interval: 90 }
  );

  const holdPrev = useHoldRepeat(
    () => {
      if (!isFirst) prevStep();
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
    ? "border-tn-danger/35 bg-tn-danger/15 text-tn-danger hover:bg-tn-danger/20"
    : "border-tn-success/35 bg-tn-success/15 text-tn-success hover:bg-tn-success/20";

  const playTitle = isPlaying ? "Pause" : "Play";

  return (
    <div className={groupClass}>
      <TransportButton
        disabled={isFirst}
        title="Previous"
        ariaLabel="Previous"
        buttonProps={holdPrev}
        className={btnBase}
      >
        <SkipBack size={14} />
      </TransportButton>

      <TransportButton
        title={playTitle}
        ariaLabel={playTitle}
        onClick={togglePlayPause}
        className={`${btnBase} border transition ${playVisual}`}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={14} />}
      </TransportButton>

      <TransportButton
        title="Stop"
        ariaLabel="Stop"
        onClick={reset}
        className={btnBase}
      >
        <Square size={14} />
      </TransportButton>

      <TransportButton
        disabled={isLast}
        title="Next"
        ariaLabel="Next"
        buttonProps={holdNext}
        className={btnBase}
      >
        <SkipForward size={14} />
      </TransportButton>
    </div>
  );
}

export default memo(Transport);
