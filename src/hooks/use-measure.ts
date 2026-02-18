import { useCallback, useLayoutEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

export function useMeasure<T extends HTMLElement>(offset: number = 0) {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  // keep last non-zero measurement
  const lastSize = useRef<Size>({ width: 0, height: 0 });

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useLayoutEffect(() => {
    if (!node) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const nextWidth = Math.max(0, width - offset);

      // ignore zero-width regression once measured
      if (nextWidth === 0 && lastSize.current.width > 0) return;

      if (
        lastSize.current.width !== nextWidth ||
        lastSize.current.height !== height
      ) {
        lastSize.current = { width: nextWidth, height };
        setSize(lastSize.current);
      }
    });

    ro.observe(node);
    return () => ro.disconnect();
  }, [node, offset]);

  return { ref, size };
}
