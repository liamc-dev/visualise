// src/components/ui/TextInput.tsx

import React from "react";
import { X } from "lucide-react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type TextInputSize = "sm" | "md";

type TextInputProps = {
  size?: TextInputSize;
  error?: boolean;
  onClear?: () => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ size = "md", error, onClear, className, value, ...rest }, ref) => {
    const base = cx(
      "w-full border text-tn-text",
      "focus:outline-none focus:ring-2",
      "placeholder:text-tn-muted/60",
      "transition",
      "disabled:opacity-60"
    );

    const sizeCls =
      size === "sm"
        ? "h-7 px-2 rounded-lg text-xs"
        : "h-10 px-3 rounded-xl text-sm";

    const borderCls = error
      ? "border-red-500/70 focus:ring-red-500/30"
      : "border-tn-border focus:ring-tn-accent/30";

    const showClear = onClear && value;

    return (
      <div className="relative">
        <input
          ref={ref}
          value={value}
          className={cx(base, sizeCls, borderCls, "bg-tn-surfaceSoft/55", showClear && "pr-7", className)}
          {...rest}
        />
        {showClear && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            aria-label="Clear"
            className={cx(
              "absolute right-1.5 top-1/2 -translate-y-1/2",
              "flex items-center justify-center rounded",
              "text-tn-muted hover:text-tn-text transition-colors",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )}
          >
            <X size={size === "sm" ? 12 : 14} />
          </button>
        )}
      </div>
    );
  }
);
