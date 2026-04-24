export function Badge({
  type,
  variant = "default",
}: {
  type: string;
  variant?: "default" | "success" | "warning";
}) {
  const styles = {
    default: "border-accent/30 bg-accent-muted text-accent-ink",
    success: "border-success/30 bg-success-muted text-success",
    warning: "border-warning/35 bg-warning-muted text-warning",
  } as const;

  const v =
    variant === "success"
      ? styles.success
      : variant === "warning"
        ? styles.warning
        : styles.default;

  return (
    <span
      className={`inline-flex items-center rounded-notion border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ${v}`}
    >
      {type}
    </span>
  );
}
