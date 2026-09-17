import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Loading Soodha
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Preparing your money data...
        </p>
      </div>
    </div>
  );
}