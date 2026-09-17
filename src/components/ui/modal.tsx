"use client";

import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { X } from "lucide-react";

type ModalWidth = "sm" | "md" | "lg";

const widthClassNames: Record<ModalWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = "lg",
  headerAdornment,
  showCloseButton = true,
  isDismissDisabled = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: ModalWidth;
  headerAdornment?: ReactNode;
  showCloseButton?: boolean;
  isDismissDisabled?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement =
      document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const [firstFocusableElement] = getFocusableElements(dialog);

      if (firstFocusableElement) {
        firstFocusableElement.focus();
      } else {
        dialog.focus();
      }
    });

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDismissDisabled) {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = getFocusableElements(dialog);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isDismissDisabled, isOpen]);

  if (!isOpen) return null;

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.currentTarget === event.target && !isDismissDisabled) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-xl bg-card shadow-xl ${widthClassNames[width]}`}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div
            className={`min-w-0 ${headerAdornment ? "flex items-start gap-3" : ""}`}
          >
            {headerAdornment}
            <div className="min-w-0">
              <h2 id={titleId} className="font-semibold text-foreground">
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              disabled={isDismissDisabled}
              aria-label="Close dialog"
              className="ml-4 shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
