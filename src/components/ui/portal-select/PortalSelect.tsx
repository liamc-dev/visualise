import PortalSelectBase, { type PortalSelectOption } from "./PortalSelectBase";

export type { PortalSelectOption };

export default function PortalSelect<T extends string>(props: {
  value: T;
  options: readonly PortalSelectOption<T>[];
  onChange: (v: T) => void;
  disabled?: boolean;
  menuWidth?: "match" | "content";
}) {
  const { menuWidth = "content", ...rest } = props;

  return (
    <PortalSelectBase<T>
      {...rest}
      menuWidth={menuWidth}
      buttonClassName={`
        inline-flex items-center justify-center gap-1
        rounded-st-sm px-2 py-1.5 text-xs
        text-tn-text
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-tn-accent/30
        transition-colors
      `}
      labelClassName={``}
      chevronClassName={`h-3 w-3 opacity-70 shrink-0`}
      menuClassName={`
        fixed z-[1000] overflow-hidden
        rounded-st-md border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border
        bg-tn-surface/95 backdrop-blur-[var(--st-blur-sm)] shadow-st-dropdown
      `}
      itemClassName={`
        cursor-pointer whitespace-nowrap text-xs text-tn-text
        px-3 py-1.5 hover:bg-tn-surfaceSoft
      `}
      activeItemClassName={`bg-tn-surfaceSoft`}
    />
  );
}
