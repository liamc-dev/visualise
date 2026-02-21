// src/components/ui/ResizeHandle.tsx
import React, { useCallback, useRef, useEffect } from "react";

type ResizeHandleProps = {
  /** Called on every pointer move during drag — use for DOM-only updates */
  onDrag: (deltaY: number) => void;
  /** Called once on pointer up — use to commit final value to state */
  onCommit: () => void;
  className?: string;
};

export function ResizeHandle({ onDrag, onCommit, className }: ResizeHandleProps) {
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);
  const onDragRef = useRef(onDrag);
  const onCommitRef = useRef(onCommit);
  onDragRef.current = onDrag;
  onCommitRef.current = onCommit;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientY - lastYRef.current;
      lastYRef.current = e.clientY;
      onDragRef.current(delta);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      onCommitRef.current();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      draggingRef.current = true;
      lastYRef.current = e.clientY;
    },
    [],
  );

  return (
    <div
      className={`group flex items-center justify-center h-3 cursor-row-resize select-none touch-none ${className ?? ""}`}
      onPointerDown={onPointerDown}
    >
      <div className="w-10 h-1 rounded-full bg-tn-subtle/30 transition-colors group-hover:bg-tn-accent/50 group-active:bg-tn-accent/60" />
    </div>
  );
}
