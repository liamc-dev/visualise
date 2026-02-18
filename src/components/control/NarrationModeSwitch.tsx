import IconSelect from "../ui/portal-select/IconSelect";
import { useNarrationStore } from "../../stores/useNarrationStore";
import type { NarrationMode } from "../../types/algo-types";
import { MessageSquare, Code2, Minus } from "lucide-react";

const OPTIONS = [
  { value: "explain", label: "Explain", Icon: MessageSquare },
  { value: "code", label: "Code", Icon: Code2 },
  { value: "minimal", label: "Minimal", Icon: Minus },
] as const;

export default function NarrationModeSelect() {
  const mode = useNarrationStore((s) => s.mode);
  const setMode = useNarrationStore((s) => s.setMode);

  return (
    <IconSelect<NarrationMode>
      value={mode}
      options={OPTIONS}
      onChange={setMode}
    />
  );
}

