// src/theme/StyleApplier.ts

import { useEffect } from "react";
import { useStyleStore } from "../stores/useStyleStore";

export default function StyleApplier() {
  const style = useStyleStore((s) => s.style);

  useEffect(() => {
    const root = document.documentElement;

    if (style === "default") {
      delete root.dataset.style;
    } else {
      root.dataset.style = style;
    }
  }, [style]);

  return null;
}
