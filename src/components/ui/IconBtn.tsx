import type { ComponentPropsWithRef } from "react";

type IconBtnProps = ComponentPropsWithRef<"button"> & {
  active?: boolean;
};

export function IconBtn({ active, className, children, ref, ...rest }: IconBtnProps) {
  return (
    <button
      type="button"
      ref={ref}
      className={[
        "inline-flex items-center justify-center w-10 h-10 rounded-st-md",
        "hover:bg-tn-surfaceSoft transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30",
        active && "bg-tn-surfaceSoft/70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
