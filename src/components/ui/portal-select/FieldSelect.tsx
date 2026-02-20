// src/components/ui/portal-select/FieldSelect.tsx
import PortalSelectBase, { type PortalSelectOption } from "./PortalSelectBase";

type MenuWidthMode = "match" | "content";

type Props<T extends string> = {
  value: T;
  options: readonly PortalSelectOption<T>[];
  onChange: (v: T) => void;

  disabled?: boolean;
  offset?: number;
  menuWidth?: MenuWidthMode;

  className?: string;
  menuClassName?: string;

  buttonLabel?: React.ReactNode | ((current?: PortalSelectOption<T>) => React.ReactNode);
  renderOption?: (opt: PortalSelectOption<T>, active: boolean) => React.ReactNode;
};

export default function FieldSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  offset,
  menuWidth = "match",
  className = "",
  menuClassName = "",
  buttonLabel,
  renderOption,
}: Props<T>) {
  return (
    <PortalSelectBase<T>
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      offset={offset}
      menuWidth={menuWidth}
      showChevron={true}
      buttonLabel={buttonLabel}
      renderOption={renderOption}
      buttonClassName={`
        mt-1 h-10 w-full
        inline-flex items-center justify-between gap-2
        rounded-st-sm border-[length:var(--st-border-w)] [border-style:var(--st-border-style)] border-st-border
        bg-tn-surfaceSoft/55 px-3
        text-button text-tn-text
        hover:bg-tn-surfaceSoft/65
        focus-visible:ring-2 focus-visible:ring-tn-accent/35
        ${className}
      `}
      labelClassName="min-w-0 flex-1 truncate text-left"
      chevronClassName="h-4 w-4"
      menuClassName={menuClassName}
      itemClassName={`
        text-button px-3 py-1.5
      `}
      activeItemClassName="bg-tn-surfaceSoft"
    />
  );
}
