import { useCallback, useEffect, useRef, useState } from "react";

type ResizableSplitProps = {
  ratio: number;                 // left ratio (0..1)
  onRatioChange: (next: number) => void;
  onReset?: () => void;
  minLeftPx?: number;
  minRightPx?: number;
  className?: string;
  left: React.ReactNode;
  right: React.ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ResizableSplit({
  ratio,
  onRatioChange,
  onReset,
  minLeftPx = 420,
  minRightPx = 360,
  className = "",
  left,
  right,
}: ResizableSplitProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pendingXRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const computeNextRatio = useCallback(
    (clientX: number) => {
      const root = rootRef.current;
      if (!root) return ratio;

      const r = root.getBoundingClientRect();
      const total = r.width;

      const min = minLeftPx / total;
      const max = 1 - minRightPx / total;

      const x = clientX - r.left;
      const next = x / total;

      return clamp(next, min, max);
    },
    [minLeftPx, minRightPx, ratio]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    onRatioChange(computeNextRatio(e.clientX));
    e.preventDefault();
  }, [computeNextRatio, onRatioChange]);

  const scheduleRatioUpdate = useCallback(
    (clientX: number) => {
      pendingXRef.current = clientX;
      if (rafRef.current != null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingXRef.current == null) return;

        onRatioChange(computeNextRatio(pendingXRef.current));
        pendingXRef.current = null;
      });
    },
    [computeNextRatio, onRatioChange]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    scheduleRatioUpdate(e.clientX);
    e.preventDefault();
  }, [dragging, scheduleRatioUpdate]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    e.preventDefault();
  }, [dragging]);


  // during drag, disable text selection across page
  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.userSelect = prev;
    };
  }, [dragging]);

  return (
    <div ref={rootRef} className={`w-full h-full min-h-0 ${className}`}>
      <div className="flex w-full h-full min-h-0 items-stretch gap-0">
        {/* LEFT */}
        <div
          className="min-w-0 h-full min-h-0"
          style={{ width: `${ratio * 100}%` }}
        >
          {left}
        </div>

        {/* DIVIDER */}
        <div className="relative flex-shrink-0 w-3 self-stretch">
          <button
            type="button"
            aria-label="Resize panels"
            className="group absolute inset-0 cursor-col-resize focus:outline-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDoubleClick={onReset}
          >
            {/* vertical line */}
            <span
              className="
        absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2
        bg-tn-border opacity-70
        group-hover:opacity-100
      "
            />

            {/* grab affordance */}
            <span
              className="
        absolute left-1/2 top-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2
        rounded-full bg-tn-border/20
        opacity-0 group-hover:opacity-100
      "
            />
            <span
              className="
        absolute left-1/2 top-1/2 h-6 w-[2px] -translate-x-1/2 -translate-y-1/2
        rounded bg-tn-border
        opacity-70 group-hover:opacity-100
      "
            />
          </button>
        </div>

        {/* RIGHT */}
        <div className="min-w-0 flex-1 min-h-0 h-full">
          {right}
        </div>
      </div>
    </div>
  );
}
