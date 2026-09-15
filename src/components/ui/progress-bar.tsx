export function ProgressBar({
  widthPercent,
  colorClassName = "bg-emerald-600",
}: {
  widthPercent: number;
  colorClassName?: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${widthPercent}%` }} />
    </div>
  );
}