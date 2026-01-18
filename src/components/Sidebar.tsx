// Sidebar.tsx
import { NavLink } from "react-router-dom";
import { ALGORITHMS } from "../algorithms/registry";
import Logo from "../assets/logo-tokyo.png";

type NavItem = {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
};

function NavMenu({
  navItems,
  onItemClick,
}: {
  navItems: NavItem[];
  onItemClick?: () => void;
}) {
  return (
    <nav className="px-2 py-4 space-y-2 text-sm md:text-[13px]">
      {navItems.map((item) => (
        <div key={item.to || item.label}>
          {/* Parent item */}
          {item.children ? (
            <div className="px-3 py-2 text-xs sm:text-[11px] font-semibold tracking-wider uppercase text-tn-subtle">
              {item.label}
            </div>
          ) : (
            <NavLink
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-tn-card text-tn-text"
                    : "text-tn-muted hover:text-tn-text hover:bg-tn-surfaceSoft",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          )}

          {/* Submenu */}
          {item.children && (
            <div className="ml-2 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-1.5 rounded-md text-xs transition-colors",
                      isActive
                        ? "bg-tn-accentSoft text-tn-text"
                        : "text-tn-subtle hover:text-tn-text hover:bg-tn-surfaceSoft",
                    ].join(" ")
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Build grouped algorithm nav from registry
  const grouped = Object.entries(ALGORITHMS).reduce<
    Record<string, { label: string; to: string }[]>
  >((acc, [key, def]) => {
    const category = (def as any).category ?? "Other";
    (acc[category] ??= []).push({
      label: def.label,
      to: `/visualiser/${key}`,
    });
    return acc;
  }, {});

  const algorithmGroups: NavItem[] = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, children]) => ({
      label: category,
      to: `__category__${category}`, // stable key for react map
      children: children.sort((a, b) => a.label.localeCompare(b.label)),
    }));

  const navItems: NavItem[] = [
    {
      label: "Visualiser",
      to: "/",
    },
    ...algorithmGroups,
    { label: "About", to: "/about" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-tn-surface/95 backdrop-blur-md border-r border-tn-border
          transform transition-transform duration-200 lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-14 flex items-center px-4 border-b border-tn-border">
          <span className="text-sm md:text-[13px] font-semibold tracking-wide text-tn-text">
            {/* optional title */}
          </span>
        </div>

        <NavMenu navItems={navItems} onItemClick={onClose} />
      </aside>

      {/* Desktop collapsible */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:h-screen
          bg-tn-surface/90 backdrop-blur-sm border-r border-tn-border
          transition-[width] duration-200 overflow-hidden
          ${isOpen ? "w-48" : "w-0 border-r-0"}
        `}
      >
        {/* Logo */}
        <img
          src={Logo}
          alt="AV Logo"
          className="h-auto w-auto select-none pointer-events-none px-4 py-4"
        />

        <div
          className={`transition-opacity duration-150 ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <NavMenu navItems={navItems} />
        </div>
      </aside>
    </>
  );
}
