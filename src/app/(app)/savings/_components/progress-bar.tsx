export function ProgressBar({ widthPercent }: { widthPercent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div 
        className="h-full rounded-full bg-primary"
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
}