// src/components/AlgoInfoPanel.tsx
import type { ReactNode } from "react";
import { Panel } from "../ui/Panel";
import { AsciiText } from "../ui/AsciiText";
import { ASCII_ALGO_NAMES } from "../../ascii-art";

type AlgoInfoPanelProps = {
  logoSrc: string;
  logoAlt: string;
  title: string;
  description: ReactNode;
  bullets?: string[];
};

const AlgoInfoPanel = ({
  logoSrc,
  logoAlt,
  title,
  description,
  bullets = [],
}: AlgoInfoPanelProps) => {
  return (
    <Panel
      as="aside"
      tone="base"
      className="p-4 md:p-5 flex flex-col gap-4 mb-20 shadow-st-card"
    >
      <div className="space-y-3">
        {/* Logo */}
        {logoSrc && (
          <img
            src={logoSrc}
            alt={logoAlt}
            className="
              h-20 w-auto mt-4 mb-8
              mx-auto
              select-none pointer-events-none
            "
          />
        )}

        {/* Title */}
        <div className="text-center">
          <AsciiText
            ascii={ASCII_ALGO_NAMES[title]}
            cssClass="tn-ascii-algo"
            ariaLabel={title}
            onlyTheme="tokyo-night"
            fallback={
              <h3 className="text-label font-[var(--st-fw-semibold)] tracking-[0.22em] uppercase text-tn-subtle">
                {title}
              </h3>
            }
          />
        </div>

        {/* Description */}
        <div className="text-sm text-tn-muted leading-relaxed">
          {description}
        </div>
      </div>

      {bullets.length > 0 && (
        <div className="border-t border-tn-border/80 pt-3">
          <h4 className="text-label font-[var(--st-fw-semibold)] tracking-[0.16em] uppercase text-tn-subtle mb-2">
            Summary
          </h4>

          <ul className="text-sm text-tn-muted space-y-1.5 list-disc list-inside">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
};

export default AlgoInfoPanel;
