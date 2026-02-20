// src/components/ui/portal-select/ButtonSelect.tsx
import PortalSelectBase, { type PortalSelectOption } from "./PortalSelectBase";

type MenuWidthMode = "match" | "content";

type Props<T extends string> = {
  value: T;
  options: readonly PortalSelectOption<T>[];
  onChange: (v: T) => void;

  disabled?: boolean;
  offset?: number;
  menuWidth?: MenuWidthMode;
  showChevron?: boolean;

  className?: string;
  menuClassName?: string;
  itemClassName?: string;

  buttonLabel?: React.ReactNode | ((current?: PortalSelectOption<T>) => React.ReactNode);
  renderOption?: (opt: PortalSelectOption<T>, active: boolean) => React.ReactNode;

  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  ariaLabel?: string;
};

export default function ButtonSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  offset,
  menuWidth = "content",
  showChevron = true,
  className = "rounded-st-sm px-2 py-1.5",
  menuClassName = "",
  itemClassName = "text-label px-3 py-1.5",
  buttonLabel,
  renderOption,
  buttonProps,
  ariaLabel,
}: Props<T>) {
  return (
    <PortalSelectBase<T>
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      offset={offset}
      menuWidth={menuWidth}
      showChevron={showChevron}
      buttonLabel={buttonLabel}
      renderOption={renderOption}
      buttonClassName={`
        inline-flex items-center justify-center gap-1
        text-label text-tn-text
        hover:bg-tn-surfaceSoft/70
        ${className}
      `}
      labelClassName="flex items-center justify-center"
      chevronClassName="h-3 w-3"
      menuClassName={menuClassName}
      itemClassName={itemClassName}
      activeItemClassName="bg-tn-surfaceSoft"
      buttonProps={buttonProps}
      ariaLabel={ariaLabel}
    />
  );
}
