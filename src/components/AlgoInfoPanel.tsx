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
        bg-tn-surfaceSoft/80 backdrop-blur-sm 
        p-4 md:p-5 
        flex flex-col gap-4
        shadow-[0_0_30px_rgba(122,162,247,0.18)]
      "
    >
      <div className="space-y-3">
        {/* Logo */}
        <img
          src={logoSrc}
          alt={logoAlt}
          className="
            h-28 w-auto
            mx-auto
            select-none pointer-events-none
            drop-shadow-[0_0_10px_rgba(122,162,247,0.25)]
          "
        />

        {/* Title
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-tn-text text-center">
          {title}
        </h3> */}

        {/* Description (can contain inline code, links, etc.) */}
        <div className="text-xs text-tn-muted leading-relaxed">
          {description}
        </div>
      </div>

      {bullets.length > 0 && (
        <div className="border-t border-tn-border pt-3">
          <h4 className="text-xs font-semibold mb-1 text-tn-text">
            Next ideas
          </h4>

          <ul className="text-xs text-tn-muted space-y-1 list-disc list-inside">
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
