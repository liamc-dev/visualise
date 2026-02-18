import PortalSelectBase, { type PortalSelectOption } from "./PortalSelectBase";

export default function IconSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  className = "",
}: {
  value: T;
  options: readonly PortalSelectOption<T>[];
  onChange: (v: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <PortalSelectBase<T>
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      menuWidth="content"
      offset={6}
      showChevron={false}
      buttonClassName={`px-0 py-0 rounded-sm leading-none focus-visible:ring-0 ${className}`}
      menuClassName="rounded-md"
      itemClassName="px-2 py-1 text-[12px]"
      activeItemClassName="bg-tn-surfaceSoft"
      buttonLabel={(current) => (
        <div className="flex items-center leading-none">
          {current?.Icon ? <current.Icon size={12} /> : null}
        </div>
      )}
      renderOption={(opt, active) => (
        <div className="flex items-center gap-1.5">
          {opt.Icon ? <opt.Icon size={12} /> : null}
          <span className="text-label leading-none">{opt.label}</span>
          {active && <span className="ml-auto text-micro text-tn-subtle">✓</span>}
        </div>
      )}
    />
  );
}
