// src/components/Logo.tsx
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon */}
      <div
        className="
          h-8 w-8
          rounded-xl
          bg-gradient-to-br from-tn-accent to-tn-magenta
          shadow-[0_0_18px_rgba(122,162,247,0.65)]
          flex items-center justify-center
          relative overflow-hidden
        "
      >
        {/* Soft inner panel */}
        <div className="absolute inset-[2px] rounded-[0.65rem] bg-tn-surface/85" />

        {/* AV monogram */}
        <span className="relative text-[0.7rem] font-semibold tracking-[0.18em] text-tn-accent">
          AV
        </span>
      </div>

      {/* Text lockup */}
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold tracking-[0.28em] uppercase text-tn-text">
          Algorithm
        </span>
        <span className="text-[0.7rem] tracking-[0.26em] uppercase text-tn-muted">
          Visualiser
        </span>
      </div>
    </div>
  );
}
