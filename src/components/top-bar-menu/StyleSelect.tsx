import { Box, Terminal, Minus, Circle } from "lucide-react";
import { useStyleStore, type Style } from "../../stores/useStyleStore";
import ButtonSelect from "../ui/portal-select/ButtonSelect";
import type { PortalSelectOption } from "../ui/portal-select/PortalSelectBase";

const STYLES: readonly PortalSelectOption<Style>[] = [
  { value: "default", label: "Default", Icon: Box },
  { value: "terminal", label: "Terminal", Icon: Terminal },
  { value: "clean", label: "Clean", Icon: Minus },
  { value: "organic", label: "Organic", Icon: Circle },
];

export default function StyleSelect() {
  const style = useStyleStore((s) => s.style);
  const setStyle = useStyleStore((s) => s.setStyle);

  const currentLabel = STYLES.find((s) => s.value === style)?.label ?? "Style";

  return (
    <ButtonSelect<Style>
      value={style}
      options={STYLES}
      onChange={setStyle}
      ariaLabel={`Style: ${currentLabel}`}
      buttonProps={{ title: `Style: ${currentLabel}` }}
      buttonLabel={(current) => (current?.Icon ? <current.Icon size={16} /> : null)}
      renderOption={(opt, active) => (
        <div className={`flex items-center justify-center ${active ? "opacity-100" : "opacity-70"}`}>
          {opt.Icon ? <opt.Icon size={16} /> : null}
        </div>
      )}
      menuWidth="match"
      showChevron={false}
      className="w-10 h-10 p-0 rounded-st-md hover:bg-tn-surfaceSoft"
      itemClassName="px-0 py-2"
    />
  );
}
