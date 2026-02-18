type CardStatus = "NEW" | "LEARNING" | "REVIEW";

export function StatusBadge({ status }: { status: CardStatus }) {
  const cls =
    status === "NEW"
      ? "border-tn-cyan/30 bg-tn-cyan/10 text-tn-cyan"
      : status === "LEARNING"
        ? "border-tn-warning/30 bg-tn-warning/10 text-tn-warning"
        : "border-tn-success/30 bg-tn-success/10 text-tn-success";

  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-label ${cls}`}>
      {status}
    </span>
  );
}