// src/layout/AppShell.tsx
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import ThemeSelect from "../components/top-bar-menu/ThemeSelect";
import StyleSelect from "../components/top-bar-menu/StyleSelect";
import UserMenu from "../components/top-bar-menu/UserMenu";
import { IconBtn } from "../components/ui/IconBtn";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useBrand } from "../brand/useBrand";
import { useStyleStore } from "../stores/useStyleStore";
import { useThemeStore } from "../stores/useThemeStore";

const TOP_H = 52;
const RAIL_W = 72;
const OPEN_W = 260;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [isDesktop]);

  const effectsEnabled = useSettingsStore((s) => s.effectsEnabled);
  const toggleEffects = useSettingsStore((s) => s.toggleEffects);
  const { appLogoSrc, appLogoAlt } = useBrand();
  const style = useStyleStore((s) => s.style);
  const themeKey = useThemeStore((s) => s.theme);
  const desktopSidebarW = isSidebarOpen ? OPEN_W : RAIL_W;

  return (
    <div className="h-screen overflow-hidden bg-tn-bg text-tn-text flex flex-col">

      <header className="sticky top-0 z-50 bg-tn-bg shrink-0"
        style={{
          height: `${TOP_H}px`,
        }}>
        <div className="h-full flex">
          <div
            className="flex items-center justify-center"
            style={{ width: isDesktop ? RAIL_W : TOP_H }}
          >
            <IconBtn
              onClick={() => setIsSidebarOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <MenuIcon className="h-6 w-6" />
            </IconBtn>
          </div>

          <div className="h-full flex flex-1 items-center">
            {appLogoSrc ? (
              <img
                src={appLogoSrc}
                alt={appLogoAlt ?? "App logo"}
                className="h-7 w-auto select-none pointer-events-none opacity-95"
              />
            ) : style === "terminal" && themeKey === "tokyo-night" ? (
              <pre className="tn-brand-ascii text-tn-text select-none leading-none" aria-label="Visualiser">{
`  _   ___               ___
 | | / (_)__ __ _____ _/ (_)__ ___ ____
 | |/ / (_-</ // / _ \`/ / (_-</ -_) __/
 |___/_/___/\\_,_/\\_,_/_/_/___/\\__/_/`
              }</pre>
            ) : (
              <span className="tn-brand-text text-ui text-tn-text">
                {appLogoAlt ?? "App"}
              </span>
            )}

            <div className="flex-1" />
            <IconBtn
              onClick={toggleEffects}
              title="Toggle effects"
              aria-label="Toggle effects"
            >
              <Zap
                size={16}
                className={effectsEnabled ? "text-tn-accent" : "text-tn-muted"}
                fill={effectsEnabled ? "currentColor" : "none"}
              />
            </IconBtn>
            <StyleSelect />
            <ThemeSelect />
            <UserMenu></UserMenu>
          </div>
        </div>
      </header>

      <Sidebar
        topOffset={TOP_H}
        isOpen={isSidebarOpen}
        isDesktop={isDesktop}
        railWidth={RAIL_W}
        openWidth={OPEN_W}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN */}
      <main
        className="flex-1 min-h-0 overflow-auto border border-tn-border/15 transition-[padding-left] duration-300"
        style={{ paddingLeft: isDesktop ? desktopSidebarW : 0 }}
      >
        <div className="w-full px-4 py-2 h-full">
          <div className="mx-auto w-full max-w-[1800px] h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
