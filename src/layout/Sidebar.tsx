// src/layout/Sidebar.tsx
import React, { useMemo, useState } from "react";
import { NavLink, useLocation, matchPath } from "react-router-dom";
import { useAlgorithmMenu } from "../hooks/use-algorithm-menu";
import { Panel } from "../components/ui/Panel";

import {
  Info,
  Brain,
  ChevronDown,
  Share2,
} from "lucide-react";
import { TextInput } from "../components/ui/TextInput";

type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  hideWhenCollapsed?: boolean;
};

type NavSection = {
  header: string;
  items: NavItem[];
  kind?: "primary" | "algos";
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Row ---------- */

function SideRow({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isSamePath = !!matchPath({ path: item.to, end: false }, location.pathname);

  if (collapsed && item.hideWhenCollapsed) return null;

  return (
    <NavLink
      to={item.to}
      onClick={(e) => {
        if (isSamePath) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <div
          className={cn(
            "group relative flex items-center rounded-xl",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30",
            item.icon ? "gap-0.5" : "gap-0 pl-3 py-1.5",
            isActive
              ? "bg-tn-card text-tn-text"
              : "text-tn-muted hover:text-tn-text hover:bg-tn-surfaceSoft"
          )}
        >
          {/* Active accent pill */}
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-tn-accent transition-all duration-200",
              isActive ? "h-4 opacity-100" : "h-0 opacity-0"
            )}
          />

          {item.icon && (
            <span
              className={cn(
                "flex items-center justify-center text-current",
                collapsed ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg"
              )}
            >
              {item.icon}
            </span>
          )}

          {/* Animated text label */}
          <span
            className={cn(
              "truncate text-ui transition-all duration-200",
              collapsed
                ? "opacity-0 -translate-x-2 w-0 overflow-hidden"
                : "opacity-100 translate-x-0"
            )}
          >
            {item.label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

/* ---------- Collapsible Category ---------- */

function AlgoCategory({
  header,
  items,
  collapsed,
  defaultOpen,
  onItemClick,
}: {
  header: string;
  items: NavItem[];
  collapsed: boolean;
  defaultOpen?: boolean;
  onItemClick?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(!!defaultOpen);

  if (collapsed) return null;

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between",
          "px-2 py-1.5 rounded-xl",
          "text-tn-subtle/80 hover:text-tn-text hover:bg-tn-surfaceSoft",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-label font-medium tracking-[0.18em] uppercase">
            {header}
          </span>
          <span className="text-label text-tn-muted/80">({items.length})</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-80 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Animated accordion via CSS grid trick */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-0.5 pb-1.5">
            {items.map((it) => (
              <SideRow
                key={it.to}
                item={it}
                collapsed={collapsed}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

function Section({
  section,
  collapsed,
  onItemClick,
}: {
  section: NavSection;
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const items = collapsed
    ? section.items.filter((it) => !it.hideWhenCollapsed)
    : section.items;

  if (collapsed && items.length === 0) return null;

  return (
    <div>
      {/* Header always rendered, fades on collapse */}
      <div
        className={cn(
          "px-3 pb-1.5 text-label font-medium tracking-[0.18em] uppercase text-tn-subtle/70 transition-opacity duration-200",
          collapsed ? "opacity-0" : "opacity-100"
        )}
      >
        {section.header}
      </div>

      <div className="space-y-1 px-4">
        {items.map((it) => (
          <SideRow
            key={it.to}
            item={it}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Content ---------- */

function SidebarContent({
  sections,
  collapsed,
  onItemClick,
}: {
  sections: NavSection[];
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const [query, setQuery] = useState("");
  const { groups, isLoading } = useAlgorithmMenu(query);

  const algoGroups: Array<{ header: string; items: NavItem[] }> = useMemo(
    () =>
      groups.map((g) => ({
        header: g.header,
        items: g.items.map((it) => ({
          label: it.label,
          to: it.to,
          hideWhenCollapsed: true,
        })),
      })),
    [groups]
  );

  const visibleSections = collapsed
    ? sections.filter((sec) => sec.items.some((it) => !it.hideWhenCollapsed))
    : sections;

  return (
    <nav className="flex flex-col h-full">
      {/* Top: primary nav sections */}
      <div className="shrink-0">
        {visibleSections.map((sec) => (
          <div key={sec.header}>
            <Section section={sec} collapsed={collapsed} onItemClick={onItemClick} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className={cn(
          "mx-4 border-t border-tn-border/30 my-2 transition-opacity duration-200",
          collapsed ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Bottom: browse algorithms (scrollable) */}
      <div
        className={cn(
          "flex-1 min-h-0 flex flex-col transition-opacity duration-200",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="shrink-0 px-3 pb-1.5 text-label font-medium tracking-[0.18em] uppercase text-tn-subtle/70">
          Browse Algorithms
        </div>

        <div className="shrink-0 px-3 pb-2">
          <TextInput
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
          />
        </div>

        {isLoading && (
          <div className="px-5 py-3 text-xs text-tn-muted">
            Loading algorithms…
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {algoGroups.map((g, idx) => (
            <AlgoCategory
              key={g.header}
              header={g.header}
              items={g.items}
              collapsed={collapsed}
              defaultOpen={idx === 0 && !query}
              onItemClick={onItemClick}
            />
          ))}

          {algoGroups.length === 0 && !isLoading && (
            <div className="px-5 py-3 text-xs text-tn-muted">
              No matches.
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ---------- Sidebar ---------- */

export default function Sidebar({
  topOffset,
  isOpen,
  isDesktop,
  railWidth,
  openWidth,
  onClose,
}: {
  topOffset: number;
  isOpen: boolean;
  isDesktop: boolean;
  railWidth: number;
  openWidth: number;
  onClose: () => void;
}) {
  const sections = useMemo<NavSection[]>(
    () => [
      {
        header: "Menu",
        items: [
          { label: "Algorithms", to: "/visualiser", icon: <Share2 className="h-4 w-4" /> },
          // { label: "Memorise", to: "/memorise", icon: <Brain className="h-4 w-4" /> },
          { label: "About", to: "/about", icon: <Info className="h-4 w-4" /> },
        ],
      },
    ],
    []
  );

  const collapsed = isDesktop ? !isOpen : false;
  const width = isDesktop ? (isOpen ? openWidth : railWidth) : 288;

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          style={{ top: topOffset }}
          onClick={onClose}
        />
      )}

      <Panel
        as="aside"
        tone="base"
        radius="lg"
        border={false}
        className={cn(
          "fixed left-0 z-50 overflow-hidden py-2",
          !isDesktop && "transition-transform duration-200",
          !isDesktop && (isOpen ? "translate-x-0" : "-translate-x-full"),
          isDesktop && "z-40 transition-[width] duration-300"
        )}
        style={{
          top: topOffset,
          height: `calc(100vh - ${topOffset}px)`,
          width,
        }}
      >
        <SidebarContent
          sections={sections}
          collapsed={collapsed}
          onItemClick={!isDesktop ? onClose : undefined}
        />
      </Panel>
    </>
  );
}
