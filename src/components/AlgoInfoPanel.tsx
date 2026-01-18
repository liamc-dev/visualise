// src/components/AlgoInfoPanel.tsx
import type { ReactNode } from "react";

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
    <aside
      className="
        rounded-2xl
        border border-tn-border
        bg-tn-surfaceSoft/85 backdrop-blur-sm
        p-4 md:p-5
        flex flex-col gap-4
        shadow-[0_12px_30px_rgba(0,0,0,0.10)]
        dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
      "
      style={{ boxShadow: "var(--panel-glow)" }}
    >
      <div className="space-y-3">
        {/* Logo */}
        <img
          src={logoSrc}
          alt={logoAlt}
          className="
            h-24 w-auto
            mx-auto
            select-none pointer-events-none
            drop-shadow-[0_6px_18px_rgba(0,0,0,0.10)]
            dark:drop-shadow-[0_10px_26px_rgba(0,0,0,0.45)]
          "
        />

        {/* Title */}
        <h3 className="text-[11px] font-semibold tracking-[0.22em] uppercase text-tn-subtle text-center">
          {title}
        </h3>

        {/* Description */}
        <div className="text-sm text-tn-muted leading-relaxed">
          {description}
        </div>
      </div>

      {bullets.length > 0 && (
        <div className="border-t border-tn-border/80 pt-3">
          <h4 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-tn-subtle mb-2">
            Next ideas
          </h4>

          <ul className="text-sm text-tn-muted space-y-1.5 list-disc list-inside">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default AlgoInfoPanel;
