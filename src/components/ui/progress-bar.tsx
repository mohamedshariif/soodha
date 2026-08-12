export function ProgressBar({
  value,
  barClassName = "bg-emerald-600",
  className = "",
}: {
  value: number;
  barClassName?: string;
  className?: string;
}) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full rounded-full ${barClassName}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}