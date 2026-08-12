import { Loader2 } from "lucide-react";

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  className = "",
  disabled,
}: {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}