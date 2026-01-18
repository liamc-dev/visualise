import { useThemeStore, Theme } from "../../stores/useThemeStore";
import { Sun, Moon, Sparkles } from "lucide-react";

const THEMES: {
  id: Theme;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}[] = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "tokyo-night", label: "Tokyo Night", Icon: Sparkles },
  ];

export default function ThemeSelect() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-widest uppercase opacity-60">
        Theme
      </span>

      <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-1">
        {THEMES.map(({ id, label, Icon }) => {
          const active = theme === id;
          const isLight = id === "light";

          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => setTheme(id)}
              className={[
                "h-8 w-8 rounded-md grid place-items-center transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]",

                active
                  ? isLight
                    ? "bg-white text-slate-900 border border-slate-300 shadow-sm"
                    : "bg-[rgb(var(--accent))] text-white shadow-sm"
                  : "text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--surface-soft))]",
              ].join(" ")}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
