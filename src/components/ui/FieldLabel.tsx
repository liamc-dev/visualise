import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type FieldLabelProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function FieldLabel({
  as: As = "div",
  className,
  children,
}: FieldLabelProps) {
  return (
    <As
      className={cx(
        "text-label tracking-label uppercase text-tn-subtle/70",
        className
      )}
    >
      {children}
    </As>
  );
}
