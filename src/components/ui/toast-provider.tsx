"use client";

import {
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

type ToastInput = {
  type?: ToastType;
  title: string;
  message?: string;
};

type Toast = ToastInput & {
  id: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function getToastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconClassName: "bg-muted text-emerald-600",
        borderClassName: "border-primary",
      };

    case "error":
      return {
        icon: <CircleAlert className="h-5 w-5" />,
        iconClassName: "bg-muted text-red-600",
        borderClassName: "border-red-500",
      };

    default:
      return {
        icon: <Info className="h-5 w-5" />,
        iconClassName: "bg-slate-100 text-slate-600",
        borderClassName: "border-slate-200",
      };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();

      const nextToast: Toast = {
        id,
        type: toast.type ?? "info",
        title: toast.title,
        message: toast.message,
      };

      setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, 4));

      window.setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);

          return (
            <div
              key={toast.id}
              className={`rounded-xl border ${styles.borderClassName} bg-card p-4 shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${styles.iconClassName}`}>
                  {styles.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {toast.title}
                  </p>

                  {toast.message && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}