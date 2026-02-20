// src/components/ui/portal-select/PortalSelectBase.tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type PortalSelectOption<T extends string> = {
  value: T;
  label: string;
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
};

type MenuWidthMode = "match" | "content";

type Props<T extends string> = {
  value: T;
  options: readonly PortalSelectOption<T>[];
  onChange: (value: T) => void;

  disabled?: boolean;
  offset?: number;
  menuWidth?: MenuWidthMode;
  showChevron?: boolean;

  // styling hooks
  buttonClassName?: string;
  labelClassName?: string;
  chevronClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;

  // trigger accessibility + pass-through props
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  ariaLabel?: string;

  // render hooks
  buttonLabel?: React.ReactNode | ((current?: PortalSelectOption<T>) => React.ReactNode);
  renderOption?: (opt: PortalSelectOption<T>, active: boolean) => React.ReactNode;
};

function cn(...v: Array<string | undefined | false | null>) {
  return v.filter(Boolean).join(" ");
}

export default function PortalSelectBase<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  offset = 6,
  menuWidth = "match",
  showChevron = true,

  buttonClassName,
  labelClassName,
  chevronClassName,
  menuClassName,
  itemClassName,
  activeItemClassName,

  buttonProps,
  ariaLabel,

  buttonLabel,
  renderOption,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const current = useMemo(
    () => options.find((o) => o.value === value) ?? options[0],
    [options, value]
  );

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + offset, left: r.left, width: r.width });
  };

  // Seed highlight to the current value when opening
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => updatePos();
    const onScroll = () => updatePos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i) => Math.min((i < 0 ? 0 : i) + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setHighlight(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setHighlight(options.length - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[highlight];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
          btnRef.current?.focus();
        }
      }
    };

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, options, highlight, onChange]);

  const labelNode =
    typeof buttonLabel === "function"
      ? buttonLabel(current)
      : buttonLabel ?? current?.label;

  const menuStyle =
    menuWidth === "content"
      ? { top: pos.top, left: pos.left, minWidth: pos.width, width: "max-content" as const }
      : { top: pos.top, left: pos.left, width: pos.width };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-state={open ? "open" : "closed"}
        {...buttonProps}
        className={cn(
          "inline-flex items-center justify-center select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30",
          "transition-colors",
          disabled && "opacity-60 cursor-not-allowed",
          buttonClassName,
          buttonProps?.className
        )}
      >
        <span className={cn("min-w-0", labelClassName)}>{labelNode}</span>
        {showChevron ? (
          <ChevronDown className={cn("shrink-0 opacity-70", chevronClassName)} />
        ) : null}
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            aria-activedescendant={highlight >= 0 ? `ps-opt-${highlight}` : undefined}
            className={cn(
              "fixed z-[1000] overflow-hidden",
              "rounded-2xl border border-tn-border/60 bg-tn-surface/90 backdrop-blur-md shadow-lg",
              menuClassName
            )}
            style={menuStyle}
          >
            {options.map((o, idx) => {
              const active = o.value === value;
              const isHighlighted = idx === highlight;

              return (
                <li
                  id={`ps-opt-${idx}`}
                  role="option"
                  aria-selected={active}
                  key={o.value}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className={cn(
                    "cursor-pointer whitespace-nowrap text-tn-text",
                    "hover:bg-tn-surfaceSoft",
                    itemClassName,
                    isHighlighted && "bg-tn-surfaceSoft",
                    active && activeItemClassName
                  )}
                >
                  {renderOption ? (
                    renderOption(o, active)
                  ) : (
                    <div className="flex items-center gap-2">
                      {o.Icon ? <o.Icon size={14} /> : null}
                      <span>{o.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
