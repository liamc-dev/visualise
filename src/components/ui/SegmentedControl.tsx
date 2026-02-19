import React from "react";
import { Panel } from "./Panel";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <Panel tone="soft" radius="xl" className={cx("mt-1 inline-flex p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cx(
              "h-8 rounded-lg px-3 text-label font-semibold transition",
              active ? "bg-tn-surface/70" : "hover:bg-tn-surfaceSoft/70"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </Panel>
  );
}
