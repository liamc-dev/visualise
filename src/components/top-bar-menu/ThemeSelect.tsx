import { Sun, Moon, Sparkles, Flame, Zap } from "lucide-react";
import { useThemeStore, type Theme } from "../../stores/useThemeStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { IconBtn } from "../ui/IconBtn";
import ButtonSelect from "../ui/portal-select/ButtonSelect";
import type { PortalSelectOption } from "../ui/portal-select/PortalSelectBase";

const THEMES: readonly PortalSelectOption<Theme>[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "tokyo-night", label: "Tokyo Night", Icon: Sparkles },
  { value: "ember", label: "Ember", Icon: Flame },
];

export default function ThemeSelect() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const toggleEffects = useSettingsStore((s) => s.toggleEffects);

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? "Theme";

  return (
    <div className="flex items-center gap-1">
      <IconBtn
        onClick={toggleEffects}
        title="Toggle effects"
        aria-label="Toggle effects"
      >
        <Zap
          size={16}
          className={effectsEnabled ? "text-tn-accent" : "text-tn-textMuted"}
          fill={effectsEnabled ? "currentColor" : "none"}
        />
      </IconBtn>

      <ButtonSelect<Theme>
        value={theme}
        options={THEMES}
        onChange={setTheme}
        ariaLabel={`Theme: ${currentLabel}`}
        buttonProps={{ title: `Theme: ${currentLabel}` }}
        buttonLabel={(current) => (current?.Icon ? <current.Icon size={16} /> : null)}
        renderOption={(opt, active) => (
          <div className={`flex items-center justify-center ${active ? "opacity-100" : "opacity-70"}`}>
            {opt.Icon ? <opt.Icon size={16} /> : null}
          </div>
        )}
        menuWidth="match"
        showChevron={false}
        className="w-10 h-10 p-0 rounded-xl hover:bg-tn-surfaceSoft"
        itemClassName="px-0 py-2"
      />
    </div>
  );
}
