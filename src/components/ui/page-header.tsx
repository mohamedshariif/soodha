export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}