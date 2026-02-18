import type { FieldBind } from "../../hooks/use-field";

type Props = {
  label: React.ReactNode;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  field: {
    bind: FieldBind;
    error: string | null;
    showError: boolean;
    isValid: boolean;
  };
  rightSlot?: React.ReactNode;
};

export function AuthInput({ label, type = "text", placeholder, autoComplete, disabled, field, rightSlot }: Props) {
  const borderClass = field.showError
    ? "border-red-500/40 focus:ring-red-500/25"
    : field.isValid
      ? "border-tn-success/35 focus:ring-tn-success/20"
      : "border-tn-border focus:ring-tn-accent/40";

  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-tn-muted">{label}</span>

      <div className="relative">
        <input
          {...field.bind}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
          className={[
            "h-11 w-full rounded-xl border bg-tn-surfaceSoft/60 px-3 outline-none",
            "text-tn-text caret-tn-text transition",
            "placeholder:text-tn-muted/60 disabled:opacity-60",
            rightSlot ? "pr-12" : "",
            borderClass,
          ].join(" ")}
          placeholder={placeholder}
          aria-invalid={field.showError}
        />

        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>

      <div className="min-h-[16px] text-label">
        {field.showError ? (
          <span className="text-red-200">{field.error}</span>
        ) : field.isValid ? (
          <span className="text-tn-success/90">Looks good.</span>
        ) : (
          <span className="text-tn-muted"> </span>
        )}
      </div>
    </label>
  );
}
