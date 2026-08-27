"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react";

function isMonthValue(value?: string | null) {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

function getCurrentMonthValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1, 12, 0, 0, 0)));
}

function addMonths(monthValue: string, amount: number) {
  const [year, month] = monthValue.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1 + amount, 1, 12, 0, 0, 0));

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${nextYear}-${nextMonth}`;
}

function getMonthOptions(currentMonth: string) {
  return Array.from({ length: 24 }, (_, index) => {
    const value = addMonths(currentMonth, -index);

    return {
      value,
      label: formatMonthLabel(value),
    };
  });
}


export function MonthSelector({ value }: { value: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonth = getCurrentMonthValue();
  const selectedValue = isMonthValue(value) ? value : currentMonth;

  const monthOptions = getMonthOptions(currentMonth);

  function changeMonth(nextValue: string) {

    const params = new URLSearchParams(searchParams.toString());

    params.set("month", nextValue);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const selectedEl = listRef.current?.querySelector('[data-selected="true"]');
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative w-35">
      <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition hover:border-border-subtle focus:border-border-strong focus:outline-none"
      >
        <span className="flex min-w-0 items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span className="truncate">{formatMonthLabel(selectedValue)}</span>
        </span>

        <ChevronDown
          className={`w-3 h-3 shrink-0 text-muted-foreground transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute right-0 z-50 mt-1 max-h-50 w-full overflow-y-auto scrollbar-none rounded-xl border border-border-strong bg-card p-1 shadow-lg"
        >
          {monthOptions.map((option) => {
            const isSelected = option.value === selectedValue;
            const isCurrent = option.value === currentMonth;

            return (
              <button
                key={option.value}
                type="button"
                data-selected={isSelected || undefined}
                onClick={() => changeMonth(option.value)}
                aria-current={isCurrent ? "date" : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : isCurrent
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {isCurrent && !isSelected && (
                    <span 
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                  )}
                </span>

                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}