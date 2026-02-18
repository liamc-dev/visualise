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
        bg-tn-bg backdrop-blur-sm
        p-4 md:p-5
        flex flex-col gap-4
        mb-20
      "
      style={{ boxShadow: "var(--card-shadow)" }}

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
        <h3 className="text-label font-semibold tracking-[0.22em] uppercase text-tn-subtle text-center">
          {title}
        </h3>

        {/* Description */}
        <div className="text-sm text-tn-muted leading-relaxed">
          {description}
        </div>
      </div>

      {bullets.length > 0 && (
        <div className="border-t border-tn-border/80 pt-3">
          <h4 className="text-label font-semibold tracking-[0.16em] uppercase text-tn-subtle mb-2">
            Summary
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
