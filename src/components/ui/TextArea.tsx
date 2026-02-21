// src/components/ui/TextArea.tsx

import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type TextAreaSize = "sm" | "md";

type TextAreaProps = {
  size?: TextAreaSize;
  error?: boolean;
  className?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ size = "md", error, className, ...rest }, ref) => {
    const base = cx(
      "w-full border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] text-tn-text",
      "bg-tn-surfaceSoft/55",
      "focus:outline-none focus:ring-2",
      "placeholder:text-tn-muted/60",
      "transition",
      "disabled:opacity-60",
      "resize-none",
    );

    const sizeCls =
      size === "sm"
        ? "min-h-7 px-2 py-1 rounded-st-sm text-xs leading-snug"
        : "min-h-10 px-3 py-2 rounded-st-md text-sm leading-snug";

    const borderCls = error
      ? "border-tn-danger/70 focus:ring-tn-danger/30"
      : "border-tn-border focus:ring-tn-accent/30";

    return (
      <textarea
        ref={ref}
        className={cx(base, sizeCls, borderCls, className)}
        {...rest}
      />
    );
  },
);
