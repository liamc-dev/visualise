// src/components/ui/Btn.tsx
import React from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "soft" | "ghost" | "danger" | "dangerGhost";
type Size = "sm" | "md" | "icon";

type BtnProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  pressed?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "className" | "children" | "disabled"
>;

export function Btn<T extends React.ElementType = "button">({
  as,
  className,
  children,
  disabled = false,
  variant = "soft",
  size = "sm",
  pressed = false,
  ...restProps
}: BtnProps<T>) {
  const As = as ?? "button";

  const base = cx(
    "inline-flex items-center justify-center gap-2",
    "border select-none",
    "transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-tn-accent/30",
    disabled && "opacity-60 cursor-not-allowed pointer-events-none"
  );

  const sizeCls =
    size === "md"
      ? "h-10 px-3 rounded-2xl text-button font-semibold"
      : size === "icon"
        ? "h-6 w-6 p-0 rounded-xl"
        : "h-6 px-2.5 rounded-xl text-label font-semibold";

  const variantCls = (() => {
    switch (variant) {
      case "primary":
        return cx(
          "bg-tn-surfaceSoft/70 border-tn-border",
          "hover:bg-tn-surfaceSoft/85"
        );

      case "soft":
        return cx(
          "bg-tn-surface/60 border-tn-border/60",
          "hover:bg-tn-surfaceSoft/80"
        );

      case "ghost":
        return cx(
          "bg-transparent border-tn-border/50",
          "hover:bg-tn-surfaceSoft/60 hover:border-tn-border/70"
        );

      case "danger":
        return cx(
          "bg-tn-danger/10 border-tn-danger/40 text-tn-danger",
          "hover:bg-tn-danger/15 hover:border-tn-danger/55",
          "focus:ring-tn-danger/30"
        );

      case "dangerGhost":
        return cx(
          "bg-transparent border-tn-border/70 text-tn-muted",
          "hover:bg-tn-danger/10 hover:border-tn-danger/40 hover:text-tn-danger",
          "focus:ring-tn-danger/30"
        );

      default:
        return "";
    }
  })();

  const pressedCls = pressed
  ? cx(
      "bg-tn-surface",
      "border-tn-border/90",
      "text-tn-strong",
      "ring-1 ring-tn-accent/35"
    )
  : "";

  const { onClick, tabIndex, ...rest } =
    restProps as React.ComponentPropsWithoutRef<T>;

  const maybeType =
    As === "button" && !("type" in rest) ? ({ type: "button" } as const) : null;

  const maybeDisabled =
    As === "button"
      ? { disabled }
      : {
          "aria-disabled": disabled || undefined,
          tabIndex: disabled ? -1 : tabIndex,
        };

  function handleClick(e: any) {
    if (disabled) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return;
    }
    (onClick as any)?.(e);
  }

  return (
    <As
      {...maybeType}
      {...maybeDisabled}
      {...(rest as any)}
      onClick={handleClick}
      className={cx(base, sizeCls, variantCls, className, pressedCls)}
    >
      {children}
    </As>
  );
}
