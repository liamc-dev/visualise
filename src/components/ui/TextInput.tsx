// src/components/ui/TextInput.tsx

import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type TextInputSize = "sm" | "md";

type TextInputProps = {
  size?: TextInputSize;
  error?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ size = "md", error, className, ...rest }, ref) => {
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

    return (
      <input
        ref={ref}
        className={cx(base, sizeCls, borderCls, "bg-tn-surfaceSoft/55", className)}
        {...rest}
      />
    );
  }
);
