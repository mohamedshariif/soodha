import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-medium text-slate-900">
          Loading Soodha
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Preparing your money data...
        </p>
      </div>
    </div>
  );
}